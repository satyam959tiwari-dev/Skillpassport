"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  skillNetworkCopy,
  skillNetworkEdges,
  skillNetworkNodes,
} from "@/lib/content";
import { cx } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";

const relatedMap = (() => {
  const map = new Map<string, Set<string>>();
  for (const [a, b] of skillNetworkEdges) {
    if (!map.has(a)) map.set(a, new Set());
    if (!map.has(b)) map.set(b, new Set());
    map.get(a)!.add(b);
    map.get(b)!.add(a);
  }
  return map;
})();

export function SkillNetwork() {
  const reduce = usePrefersReducedMotion();
  const [active, setActive] = useState<string>("candidate");
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [tabVisible, setTabVisible] = useState(true);

  useEffect(() => {
    const sync = () => setTabVisible(document.visibilityState === "visible");
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, []);

  const animate = !reduce && tabVisible;

  const related = useMemo(() => relatedMap.get(active) ?? new Set<string>(), [active]);

  const nodeById = useMemo(() => {
    const map = new Map<string, (typeof skillNetworkNodes)[number]>();
    for (const n of skillNetworkNodes) map.set(n.id, n);
    return map;
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border border-[var(--color-rule)] bg-[radial-gradient(circle_at_30%_20%,rgb(68_30_182/0.35),transparent_45%),radial-gradient(circle_at_80%_70%,rgb(16_113_250/0.18),transparent_40%),#0b0e38]"
      onMouseMove={(e) => {
        if (!animate) return;
        const rect = e.currentTarget.getBoundingClientRect();
        setPointer({
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      <div className="absolute inset-0 opacity-40" aria-hidden>
        <div
          className="absolute size-64 rounded-full bg-[var(--color-sky)]/20 blur-3xl"
          style={{
            left: `${pointer.x}%`,
            top: `${pointer.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />
      </div>

      <div className="relative grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-10 lg:p-10">
        <div className="relative min-h-[320px] sm:min-h-[380px]">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            role="img"
            aria-label="SkillPassport trust network connecting people, skills, credentials, assessments, expert reviews, verification, organizations, employers, and opportunities"
          >
            {skillNetworkEdges.map(([a, b]) => {
              const na = nodeById.get(a)!;
              const nb = nodeById.get(b)!;
              const lit =
                a === active ||
                b === active ||
                (related.has(a) && related.has(b));
              return (
                <motion.line
                  key={`${a}-${b}`}
                  x1={na.x}
                  y1={na.y}
                  x2={nb.x}
                  y2={nb.y}
                  stroke={lit ? "#62acfa" : "rgba(106,70,232,0.35)"}
                  strokeWidth={lit ? 0.45 : 0.25}
                  initial={false}
                  animate={
                    animate
                      ? {
                          strokeOpacity: lit ? [0.55, 1, 0.55] : 0.45,
                        }
                      : { strokeOpacity: lit ? 0.85 : 0.45 }
                  }
                  transition={
                    animate
                      ? { duration: 3.2, repeat: Infinity, ease: "easeInOut" }
                      : undefined
                  }
                />
              );
            })}
            {skillNetworkNodes.map((node, i) => {
              const isActive = node.id === active;
              const isRelated = related.has(node.id);
              return (
                <g key={node.id}>
                  {animate ? (
                    <motion.circle
                      cx={node.x}
                      cy={node.y}
                      r={isActive ? 4.2 : 3.2}
                      fill="none"
                      stroke="#62acfa"
                      strokeOpacity={isActive ? 0.55 : 0.2}
                      animate={{ r: isActive ? [4.2, 5.2, 4.2] : 3.2 }}
                      transition={{ duration: 2.8, repeat: Infinity, delay: i * 0.08 }}
                    />
                  ) : null}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={isActive ? 2.4 : 1.8}
                    fill={isActive || isRelated ? "#62acfa" : "#9a96c9"}
                    className="cursor-pointer"
                    onClick={() => setActive(node.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Select ${node.label}`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActive(node.id);
                      }
                    }}
                  />
                  <text
                    x={node.x}
                    y={node.y - 4.5}
                    textAnchor="middle"
                    className="fill-white text-[3.2px] font-medium"
                    style={{ pointerEvents: "none" }}
                  >
                    {node.label}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <div className="flex flex-col justify-center">
          <p className="sp-eyebrow mb-4">Trust layer network</p>
          <h3 className="sp-heading text-2xl sm:text-3xl">
            {nodeById.get(active)?.label}
          </h3>
          <p className="mt-3 text-[var(--color-muted)] leading-relaxed">
            {skillNetworkCopy[active] ??
              "Select a node to see how this part of the SkillPassport trust layer connects."}
          </p>
          <ul className="mt-5 flex flex-wrap gap-2" aria-label="Related nodes">
            {[...related].map((id) => (
              <li key={id}>
                <button
                  type="button"
                  className={cx(
                    "rounded-full border border-[var(--color-rule)] px-3 py-1.5 text-sm text-[var(--color-muted)] transition hover:border-[var(--color-sky)] hover:text-white",
                  )}
                  onClick={() => setActive(id)}
                >
                  {nodeById.get(id)?.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {skillNetworkNodes.map((node) => (
              <button
                key={node.id}
                type="button"
                className={cx(
                  "rounded-lg px-3 py-2 text-sm font-medium transition",
                  active === node.id
                    ? "bg-[var(--color-violet-hi)] text-white"
                    : "bg-white/5 text-[var(--color-muted)] hover:bg-white/10",
                )}
                aria-pressed={active === node.id}
                onClick={() => setActive(node.id)}
              >
                {node.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
