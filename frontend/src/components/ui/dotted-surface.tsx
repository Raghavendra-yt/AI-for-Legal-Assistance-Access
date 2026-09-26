"use client";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type DottedSurfaceProps = Omit<React.ComponentProps<"div">, "ref"> & {
  size?: number;
  opacity?: number;
  sizeAttenuation?: boolean;
  vertexColors?: boolean;
  speed?: number;
  waveAmplitude?: number;
};

export function DottedSurface({
  className,
  size = 12,
  opacity = 0.85,
  sizeAttenuation = true,
  vertexColors = true,
  speed = 0.009,
  waveAmplitude = 45,
  ...props
}: DottedSurfaceProps) {
  let theme = "dark";
  try {
    const themeContext = useTheme();
    if (themeContext?.theme) {
      theme = themeContext.theme;
    }
  } catch (_) {
    theme = "dark";
  }

  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    animationId: number;
    count: number;
  } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const SEPARATION = 140;
    const AMOUNTX = 45;
    const AMOUNTY = 65;

    // Scene setup
    const scene = new THREE.Scene();
    // Deep obsidian fog blending seamlessly into #16171A
    scene.fog = new THREE.Fog(theme === "dark" ? 0x16171a : 0xffffff, 1800, 9000);

    const camera = new THREE.PerspectiveCamera(55, width / height, 1, 10000);
    camera.position.set(0, 360, 1150);
    // Direct camera down towards the undulating plane
    camera.lookAt(0, -60, -400);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);

    const domElement = renderer.domElement;
    domElement.style.position = "absolute";
    domElement.style.top = "0";
    domElement.style.left = "0";
    domElement.style.width = "100%";
    domElement.style.height = "100%";
    domElement.style.pointerEvents = "none";

    containerRef.current.appendChild(domElement);

    // Create a circular radial glow dot texture
    const createCircleTexture = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 64;
      canvas.height = 64;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, "rgba(255, 255, 255, 1)");
        gradient.addColorStop(0.35, "rgba(230, 240, 255, 0.95)");
        gradient.addColorStop(0.7, "rgba(180, 205, 250, 0.4)");
        gradient.addColorStop(1, "rgba(180, 205, 250, 0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(32, 32, 32, 0, Math.PI * 2);
        ctx.fill();
      }
      return new THREE.CanvasTexture(canvas);
    };

    const circleTexture = createCircleTexture();

    // Create particles
    const positions: number[] = [];
    const colors: number[] = [];

    const geometry = new THREE.BufferGeometry();

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        const x = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
        const y = 0; // Animated by sine waves
        const z = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

        positions.push(x, y, z);

        if (theme === "dark") {
          // Luminous silver/ice-blue sheen
          colors.push(0.92, 0.95, 1.0);
        } else {
          colors.push(0.15, 0.15, 0.15);
        }
      }
    }

    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3)
    );
    geometry.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));

    // Create material with circular texture and depthWrite false for glowing blend
    const material = new THREE.PointsMaterial({
      size,
      map: circleTexture,
      vertexColors,
      color: vertexColors ? undefined : theme === "dark" ? 0xe2e8f0 : 0x000000,
      transparent: true,
      opacity,
      sizeAttenuation,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    // Create points object
    const points = new THREE.Points(geometry, material);
    scene.add(points);

    let count = 0;
    let animationId: number;
    let lastTime = performance.now();

    // Silky smooth animation loop
    const animate = (currentTime: number) => {
      animationId = requestAnimationFrame(animate);

      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      // Smooth increment
      count += Math.min(delta, 0.05) * (speed * 60);

      const positionAttribute = geometry.attributes.position;
      const positionsArray = positionAttribute.array as Float32Array;

      let i = 0;
      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          const index = i * 3;

          // Harmonic sine undulation for silky fluid ocean wave
          positionsArray[index + 1] =
            Math.sin(ix * 0.2 + count) * waveAmplitude +
            Math.sin(iy * 0.3 + count * 0.65) * waveAmplitude;

          i++;
        }
      }

      positionAttribute.needsUpdate = true;
      renderer.render(scene, camera);
    };

    // Handle window resize
    const handleResize = () => {
      if (!containerRef.current) return;
      const w = window.innerWidth;
      const h = window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener("resize", handleResize);

    // Start animation loop
    animationId = requestAnimationFrame(animate);

    sceneRef.current = {
      scene,
      camera,
      renderer,
      particles: points,
      animationId,
      count,
    };

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);

      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);

        geometry.dispose();
        material.dispose();
        circleTexture.dispose();
        renderer.dispose();

        if (containerRef.current && domElement.parentNode === containerRef.current) {
          containerRef.current.removeChild(domElement);
        }
      }
    };
  }, [theme, size, opacity, sizeAttenuation, vertexColors, speed, waveAmplitude]);

  return (
    <div
      ref={containerRef}
      className={cn("pointer-events-none fixed inset-0 z-0 overflow-hidden", className)}
      {...props}
    />
  );
}

export default DottedSurface;
