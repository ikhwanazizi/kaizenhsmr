// src/types/canvas-confetti.d.ts
declare module "canvas-confetti" {
  interface ConfettiOptions {
    particleCount?: number;
    angle?: number;
    spread?: number;
    startVelocity?: number;
    decay?: number;
    gravity?: number;
    drift?: number;
    ticks?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    shapes?: ("square" | "circle" | "star")[];
    zIndex?: number;
    disableForReducedMotion?: boolean;
    // add more options as needed
  }
  function confetti(options?: ConfettiOptions): Promise<null>;
  export = confetti;
}

