"use client";

import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

type Props = {
  /** SVG path `d` the pulse travels along */
  path: string;
  /** Seconds for one full trip */
  duration?: number;
  /** Stagger delay in seconds */
  delay?: number;
  /** Radius in viewBox units */
  r?: number;
  /** Soft glow radius */
  glowR?: number;
  fill?: string;
};

/**
 * Soft glowing dot that rides an SVG path (spokes / beams).
 * Hidden when the user prefers reduced motion.
 */
export function TravelPulse({
  path,
  duration = 2.8,
  delay = 0,
  r = 0.7,
  glowR = 1.6,
  fill = "#62acfa",
}: Props) {
  const reduce = usePrefersReducedMotion();
  if (reduce) return null;

  const motion = (
    <animateMotion
      dur={`${duration}s`}
      begin={`-${delay}s`}
      repeatCount="indefinite"
      path={path}
    />
  );

  return (
    <g style={{ pointerEvents: "none" }} opacity={0.95}>
      <circle r={glowR} fill={fill} opacity="0.32">
        {motion}
      </circle>
      <circle r={r} fill="#eef6ff" opacity="0.95">
        <animateMotion
          dur={`${duration}s`}
          begin={`-${delay}s`}
          repeatCount="indefinite"
          path={path}
        />
      </circle>
      <circle r={r * 0.42} fill={fill} opacity="0.95">
        <animateMotion
          dur={`${duration}s`}
          begin={`-${delay}s`}
          repeatCount="indefinite"
          path={path}
        />
      </circle>
    </g>
  );
}
