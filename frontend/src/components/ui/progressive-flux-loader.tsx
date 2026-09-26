"use client";

import * as React from "react";
import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";

import { cn } from "@/lib/utils";

/* ── types ───────────────────────────────────────────────────── */

export interface ProgressiveFluxPhase {
  /** Progress threshold (`0`–`100`) at or past which `label` is shown. */
  at: number;
  /** Text revealed once this threshold is reached. */
  label: string;
}

export interface ProgressiveFluxLoaderProps {
  /**
   * Controlled progress, `0`–`100`. When set, the loader follows this value and
   * the phase label switches at the configured thresholds. Omit it to let the
   * loader run its own looping sweep.
   */
  value?: number;
  /** Phase thresholds and their labels. Each `at` is a `0`–`100` mark. */
  phases?: ProgressiveFluxPhase[];
  /** Seconds for one full sweep when uncontrolled. Default `12`. */
  duration?: number;
  /** Restart from `0` after reaching `100` (uncontrolled only). Default `true`. */
  loop?: boolean;
  /** Show the animated phase label above the bar. Default `true`. */
  showLabel?: boolean;
  /**
   * CSS background for the bar fill. Defaults to vivid blue → cyan flux gradient.
   */
  gradient?: string;
  /** Fires once when progress reaches `100`. */
  onComplete?: () => void;
  /** Classes for the root wrapper. */
  className?: string;
  /** Classes for the bar track. */
  barClassName?: string;
  /** Classes for the phase label. */
  textClassName?: string;
}

/* ── constants ───────────────────────────────────────────────── */

const DEFAULT_PHASES: ProgressiveFluxPhase[] = [
  { at: 0, label: "Starting up" },
  { at: 25, label: "Loading assets" },
  { at: 55, label: "Preparing intelligence" },
  { at: 80, label: "Almost there" },
  { at: 100, label: "All done" },
];

const FLUX_FROM = "var(--flux-from, #1d6ffb)";
const FLUX_TO = "var(--flux-to, #74e1ff)";
const FLUX_MID = `color-mix(in oklab, ${FLUX_FROM}, ${FLUX_TO})`;

const DEFAULT_GRADIENT = `linear-gradient(90deg, ${FLUX_FROM} 0%, ${FLUX_MID} 35%, ${FLUX_TO} 55%, ${FLUX_MID} 78%, ${FLUX_FROM} 100%)`;

const BAR_SHADOW = `0 0 16px rgba(29, 111, 251, 0.4), 0 0 24px rgba(116, 225, 255, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1.5px 2px rgba(0, 40, 120, 0.3)`;

const SHEEN_GRADIENT =
  "linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.6) 50%, transparent 100%)";

/* ── helpers ─────────────────────────────────────────────────── */

/** Latest label whose threshold has been crossed. Expects pre-sorted phases. */
function pickLabel(value: number, sortedPhases: ProgressiveFluxPhase[]) {
  let active = sortedPhases[0]?.label ?? "";
  for (const phase of sortedPhases) {
    if (value >= phase.at) active = phase.label;
  }
  return active;
}

/* ── responsive label with clear visibility on all screen sizes ── */

interface FluxLabelProps {
  label: string;
  reduced: boolean;
  className?: string;
}

function FluxLabel({ label, reduced, className }: FluxLabelProps) {
  // Media queries: on mobile (text-xs/sm), tablet (text-sm), desktop (text-sm/base)
  const base = cn(
    "w-full flex items-center justify-center text-center text-xs sm:text-sm md:text-base font-semibold tracking-wide text-gray-200 capitalize px-2 leading-relaxed break-words",
    className,
  );

  if (reduced) {
    return (
      <div aria-hidden className={base}>
        {label}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={label}
        aria-hidden
        className={base}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        <span className="inline-block text-center font-medium max-w-full">
          {label}
        </span>
      </motion.div>
    </AnimatePresence>
  );
}

/* ── component ───────────────────────────────────────────────── */

export function ProgressiveFluxLoader({
  value,
  phases = DEFAULT_PHASES,
  duration = 8,
  loop = false,
  showLabel = true,
  gradient = DEFAULT_GRADIENT,
  onComplete,
  className,
  barClassName,
  textClassName,
}: ProgressiveFluxLoaderProps) {
  const reduced = !!useReducedMotion();
  const isControlled = typeof value === "number";
  const [internal, setInternal] = React.useState(0);

  const onCompleteRef = React.useRef(onComplete);
  React.useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const completedRef = React.useRef(false);

  // Uncontrolled sweep (only when value is not provided)
  React.useEffect(() => {
    if (isControlled) return;
    let raf = 0;
    let timer = 0;
    let start: number | null = null;
    const totalMs = Math.max(500, duration * 1000);

    const tick = (ts: number) => {
      if (start === null) start = ts;
      const pct = Math.min(100, ((ts - start) / totalMs) * 100);
      setInternal(pct);
      if (pct >= 100) {
        if (!completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current?.();
        }
        if (loop) {
          start = null;
          completedRef.current = false;
          timer = window.setTimeout(() => {
            setInternal(0);
            raf = requestAnimationFrame(tick);
          }, 1000);
        }
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [isControlled, duration, loop]);

  const raw = isControlled ? value! : internal;
  const current = Number.isFinite(raw) ? Math.min(100, Math.max(0, raw)) : 0;

  // Controlled completion: fire once when value crosses 100
  React.useEffect(() => {
    if (!isControlled) return;
    if (current >= 100 && !completedRef.current) {
      completedRef.current = true;
      onCompleteRef.current?.();
    } else if (current < 100) {
      completedRef.current = false;
    }
  }, [isControlled, current]);

  const sortedPhases = React.useMemo(
    () => [...phases].sort((a, b) => a.at - b.at),
    [phases],
  );
  const label = React.useMemo(
    () => pickLabel(current, sortedPhases),
    [current, sortedPhases],
  );
  const rounded = Math.round(current);

  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col items-center gap-3",
        className,
      )}
    >
      {showLabel && (
        <div className="relative min-h-[26px] sm:min-h-[30px] w-full select-none flex items-center justify-center">
          <FluxLabel
            label={label}
            reduced={reduced}
            className={textClassName}
          />
        </div>
      )}

      <div
        className={cn(
          "relative h-2.5 sm:h-3 w-full overflow-hidden rounded-full bg-[#16171A] border border-[#333333] shadow-inner",
          barClassName,
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={rounded}
        aria-valuetext={label ? `${rounded}% – ${label}` : `${rounded}%`}
        aria-label="Loading"
      >
        <motion.div
          className="relative h-full rounded-full"
          style={{ background: gradient, boxShadow: BAR_SHADOW }}
          initial={false}
          animate={{ width: `${current}%` }}
          transition={
            reduced
              ? { duration: 0 }
              : { duration: 0.35, ease: "easeOut" }
          }
        >
          {!reduced && (
            <motion.span
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 w-1/2 rounded-full"
              style={{ background: SHEEN_GRADIENT, mixBlendMode: "screen" }}
              animate={{ x: ["-110%", "210%"] }}
              transition={{ duration: 1.4, ease: "linear", repeat: Infinity }}
            />
          )}
        </motion.div>
      </div>
    </div>
  );
}

export default ProgressiveFluxLoader;
