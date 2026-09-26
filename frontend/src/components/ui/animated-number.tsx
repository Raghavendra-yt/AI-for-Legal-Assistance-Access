import React, { useEffect, useState, useRef } from "react";

export interface AnimatedNumberProps {
  value: number;
  duration?: number; // in milliseconds
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  formatCommas?: boolean;
}

export function AnimatedNumber({
  value,
  duration = 1200,
  decimals = 0,
  prefix = "",
  suffix = "",
  className = "",
  formatCommas = true,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const startValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const startVal = displayValue;
    startValueRef.current = startVal;
    startTimeRef.current = null;

    const easeOutExpo = (t: number) => {
      return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    };

    const animate = (currentTime: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const currentVal = startVal + (value - startVal) * easedProgress;
      setDisplayValue(currentVal);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(value);
      }
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [value, duration]);

  const formattedNumber = displayValue.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: formatCommas,
  });

  return (
    <span className={`inline-flex items-center font-mono tracking-tight ${className}`}>
      {prefix && <span className="opacity-80 mr-0.5">{prefix}</span>}
      <span>{formattedNumber}</span>
      {suffix && <span className="opacity-80 ml-0.5">{suffix}</span>}
    </span>
  );
}

export default AnimatedNumber;
