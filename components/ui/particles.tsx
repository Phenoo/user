"use client";

import React, { useEffect, useRef } from "react";

import { cn } from "@/lib/utils";

interface ParticlesProps {
  className?: string;
  quantity?: number;
  staticity?: number;
  ease?: number;
  size?: number;
  refresh?: boolean;
  color?: string;
  vx?: number;
  vy?: number;
}

type Circle = {
  x: number;
  y: number;
  translateX: number;
  translateY: number;
  size: number;
  alpha: number;
  targetAlpha: number;
  dx: number;
  dy: number;
  magnetism: number;
};

function hexToRgb(hex: string): [number, number, number] {
  const normalized = hex.replace("#", "");
  const expanded =
    normalized.length === 3
      ? normalized
          .split("")
          .map((character) => character + character)
          .join("")
      : normalized;
  const value = Number.parseInt(expanded, 16);

  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

function remapValue(
  value: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number
) {
  const remapped =
    ((value - start1) * (end2 - start2)) / (end1 - start1) + start2;
  return Math.max(0, remapped);
}

const Particles: React.FC<ParticlesProps> = ({
  className = "",
  quantity = 100,
  staticity = 50,
  ease = 50,
  size = 0.4,
  refresh = false,
  color = "#ffffff",
  vx = 0,
  vy = 0,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !container || !context) {
      return;
    }

    const rgb = hexToRgb(color);
    const circles: Circle[] = [];
    const mouse = { x: 0, y: 0 };
    const canvasSize = { width: 0, height: 0 };
    let devicePixelRatio = 1;
    let animationFrame: number | null = null;
    let isIntersecting = true;

    const createCircle = (): Circle => ({
      x: Math.floor(Math.random() * canvasSize.width),
      y: Math.floor(Math.random() * canvasSize.height),
      translateX: 0,
      translateY: 0,
      size: Math.floor(Math.random() * 2) + size,
      alpha: 0,
      targetAlpha: Number.parseFloat((Math.random() * 0.6 + 0.1).toFixed(1)),
      dx: (Math.random() - 0.5) * 0.1,
      dy: (Math.random() - 0.5) * 0.1,
      magnetism: 0.1 + Math.random() * 4,
    });

    const drawCircle = (circle: Circle) => {
      context.save();
      context.translate(circle.translateX, circle.translateY);
      context.beginPath();
      context.arc(circle.x, circle.y, circle.size, 0, 2 * Math.PI);
      context.fillStyle = `rgba(${rgb.join(", ")}, ${circle.alpha})`;
      context.fill();
      context.restore();
    };

    const initializeCanvas = () => {
      devicePixelRatio = Math.min(window.devicePixelRatio || 1, 2);
      canvasSize.width = container.offsetWidth;
      canvasSize.height = container.offsetHeight;
      canvas.width = canvasSize.width * devicePixelRatio;
      canvas.height = canvasSize.height * devicePixelRatio;
      canvas.style.width = `${canvasSize.width}px`;
      canvas.style.height = `${canvasSize.height}px`;
      context.setTransform(
        devicePixelRatio,
        0,
        0,
        devicePixelRatio,
        0,
        0
      );

      circles.length = 0;
      for (let index = 0; index < quantity; index += 1) {
        circles.push(createCircle());
      }
    };

    const animate = () => {
      context.clearRect(0, 0, canvasSize.width, canvasSize.height);

      circles.forEach((circle, index) => {
        const closestEdge = Math.min(
          circle.x + circle.translateX - circle.size,
          canvasSize.width - circle.x - circle.translateX - circle.size,
          circle.y + circle.translateY - circle.size,
          canvasSize.height - circle.y - circle.translateY - circle.size
        );
        const edgeAlpha = Number.parseFloat(
          remapValue(closestEdge, 0, 20, 0, 1).toFixed(2)
        );

        if (edgeAlpha > 1) {
          circle.alpha = Math.min(circle.targetAlpha, circle.alpha + 0.02);
        } else {
          circle.alpha = circle.targetAlpha * edgeAlpha;
        }

        circle.x += circle.dx + vx;
        circle.y += circle.dy + vy;
        circle.translateX +=
          (mouse.x / (staticity / circle.magnetism) - circle.translateX) /
          ease;
        circle.translateY +=
          (mouse.y / (staticity / circle.magnetism) - circle.translateY) /
          ease;

        drawCircle(circle);

        if (
          circle.x < -circle.size ||
          circle.x > canvasSize.width + circle.size ||
          circle.y < -circle.size ||
          circle.y > canvasSize.height + circle.size
        ) {
          circles[index] = createCircle();
        }
      });

      if (isIntersecting && !document.hidden) {
        animationFrame = window.requestAnimationFrame(animate);
      } else {
        animationFrame = null;
      }
    };

    const startAnimation = () => {
      if (animationFrame === null && isIntersecting && !document.hidden) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const stopAnimation = () => {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
    };

    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left - canvasSize.width / 2;
      const y = event.clientY - rect.top - canvasSize.height / 2;
      const isInside =
        Math.abs(x) < canvasSize.width / 2 &&
        Math.abs(y) < canvasSize.height / 2;

      if (isInside) {
        mouse.x = x;
        mouse.y = y;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopAnimation();
      } else {
        startAnimation();
      }
    };

    const resizeObserver = new ResizeObserver(initializeCanvas);
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = entry.isIntersecting;
      if (isIntersecting) {
        startAnimation();
      } else {
        stopAnimation();
      }
    });

    initializeCanvas();
    startAnimation();
    resizeObserver.observe(container);
    intersectionObserver.observe(container);
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopAnimation();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [color, ease, quantity, refresh, size, staticity, vx, vy]);

  return (
    <div
      className={cn("pointer-events-none", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className="size-full" />
    </div>
  );
};

export default Particles;
