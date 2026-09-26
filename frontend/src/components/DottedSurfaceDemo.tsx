import React from "react";
import DottedSurface from "@/components/ui/dotted-surface";

const settings = {
  size: 8,
  opacity: 0.8,
  sizeAttenuation: true,
  vertexColors: true,
};

export function DottedSurfaceDemo(props: Partial<typeof settings>) {
  const s = { ...settings, ...props };
  return (
    <div className="h-[400px] w-full relative overflow-hidden rounded-2xl border border-[#333333] bg-[#16171A]">
      <DottedSurface
        size={s.size}
        opacity={s.opacity}
        sizeAttenuation={s.sizeAttenuation}
        vertexColors={s.vertexColors}
        className="absolute inset-0"
      />
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <span className="text-xs font-mono uppercase tracking-widest text-gray-400 bg-[#1F2023]/80 px-4 py-2 rounded-full border border-[#444444] backdrop-blur-md">
          Three.js Dotted Surface Wave
        </span>
      </div>
    </div>
  );
}

export default DottedSurfaceDemo;
