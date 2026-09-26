import React, { useState } from "react";
import { LiquidMetalButton } from "@/components/ui/liquid-metal-button";
import { AnimatedNumber } from "@/components/ui/animated-number";
import { Sparkles, Plus, RotateCcw } from "lucide-react";

export default function LiquidMetalButtonDemo() {
  const [counter, setCounter] = useState(1450);
  const [confidence, setConfidence] = useState(98.4);

  const incrementCounter = () => {
    setCounter((prev) => prev + Math.floor(Math.random() * 25) + 5);
  };

  const randomizeConfidence = () => {
    setConfidence(Number((95 + Math.random() * 4.9).toFixed(1)));
  };

  return (
    <div className="flex flex-col items-center justify-center gap-10 p-6 w-full max-w-4xl mx-auto">
      {/* 1. Base Requested Demo: Get Started & Icon mode */}
      <div className="flex flex-col items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
          Core Liquid Metal Buttons
        </span>
        <div className="flex items-center gap-8">
          <LiquidMetalButton label="Get Started" />
          <LiquidMetalButton viewMode="icon" />
        </div>
      </div>

      {/* 2. Number Animation & Liquid Metal Counter Showcase */}
      <div className="w-full metallic-card rounded-2xl p-6 border border-zinc-800 flex flex-col items-center space-y-6">
        <div className="text-center space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-zinc-300" /> Liquid Metal Number Animations
          </span>
          <p className="text-xs text-zinc-400 max-w-md">
            Click the buttons to trigger procedural shader acceleration, interactive touch ripples, and smooth easeOutExpo number animations.
          </p>
        </div>

        {/* Live Buttons Hosting Animated Numbers */}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {/* Animated Counter Button */}
          <div className="flex flex-col items-center gap-2">
            <LiquidMetalButton
              width={160}
              label={
                <span className="flex items-center gap-1.5 font-medium">
                  <Plus className="w-3.5 h-3.5 text-zinc-400" />
                  <AnimatedNumber value={counter} prefix="" suffix=" Cases" />
                </span>
              }
              onClick={incrementCounter}
            />
            <span className="text-[11px] text-zinc-500">Click to count up</span>
          </div>

          {/* Animated Percentage Score Button */}
          <div className="flex flex-col items-center gap-2">
            <LiquidMetalButton
              width={160}
              label={
                <span className="flex items-center gap-1.5 font-medium">
                  <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
                  <AnimatedNumber value={confidence} decimals={1} suffix="% NLP" />
                </span>
              }
              onClick={randomizeConfidence}
            />
            <span className="text-[11px] text-zinc-500">Click to re-score</span>
          </div>
        </div>

        {/* Metric Badges with Liquid Sheen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-2">
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 text-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5">Statutory Rules</span>
            <div className="text-lg font-bold text-white metallic-text">
              <AnimatedNumber value={511} suffix="+" />
            </div>
          </div>
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 text-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5">Court Notices</span>
            <div className="text-lg font-bold text-white metallic-text">
              <AnimatedNumber value={counter} formatCommas={true} />
            </div>
          </div>
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 text-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5">Disputed Claims</span>
            <div className="text-lg font-bold text-white metallic-text">
              <AnimatedNumber value={6.5} decimals={1} prefix="₹" suffix=" Cr" />
            </div>
          </div>
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-xl p-3.5 text-center shadow-inner">
            <span className="text-[10px] uppercase font-bold text-zinc-500 block mb-0.5">NLP Accuracy</span>
            <div className="text-lg font-bold text-white metallic-text">
              <AnimatedNumber value={confidence} decimals={1} suffix="%" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
