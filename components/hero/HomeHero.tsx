"use client";

import Link from "next/link";
import { useEffect } from "react";
import { SiteHeader } from "@/components/navigation/SiteHeader";
import { appLinks } from "@/lib/content";

/**
 * Faithful port of the luminous-network hero visuals.
 * Navigation uses the shared Solutions / Platform dropdown system.
 */
export function HomeHero() {
  useEffect(() => {
    type NetworkWindow = Window & {
      __bootSkillNetwork?: () => void;
      __spNetworkCleanup?: () => void;
      __spNetworkScriptPromise?: Promise<void>;
    };
    const w = window as NetworkWindow;

    const ensureScript = () => {
      if (typeof w.__bootSkillNetwork === "function") {
        return Promise.resolve();
      }
      if (w.__spNetworkScriptPromise) return w.__spNetworkScriptPromise;
      w.__spNetworkScriptPromise = new Promise<void>((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>(
          'script[data-sp-network="1"]',
        );
        if (existing) {
          existing.addEventListener("load", () => resolve(), { once: true });
          existing.addEventListener(
            "error",
            () => reject(new Error("network script failed")),
            { once: true },
          );
          return;
        }
        const script = document.createElement("script");
        script.src = "/network/app.js";
        script.async = true;
        script.dataset.spNetwork = "1";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("network script failed"));
        document.body.appendChild(script);
      });
      return w.__spNetworkScriptPromise;
    };

    let cancelled = false;
    ensureScript()
      .then(() => {
        if (cancelled) return;
        w.__bootSkillNetwork?.();
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      cancelled = true;
      w.__spNetworkCleanup?.();
    };
  }, []);

  return (
    <main className="hero">
      <canvas id="network" aria-hidden="true" />
      <div className="copy-shade" />
      <div className="interface">
        {/* Fixed sticky nav — spacer keeps hero copy below the bar while scrolling */}
        <SiteHeader variant="hero" />

        <div className="event">
          AI THAT ACCELERATES TRUST
          <span className="sep" aria-hidden="true">
            ✦
          </span>
          <span className="ev2">HUMANS WHO REMAIN IN CONTROL</span>
        </div>

        <section className="copy wrap" id="top">
          <div className="eyebrow arrive">
            <i /> THE TRUST LAYER FOR SKILLS AND CAREERS
          </div>
          <h1>
            <span className="w arrive" style={{ ["--d" as string]: "0.09s" }}>
              Verify
            </span>{" "}
            <span className="w arrive" style={{ ["--d" as string]: "0.18s" }}>
              once.
            </span>
            <br />
            <span className="w arrive" style={{ ["--d" as string]: "0.27s" }}>
              Be
            </span>{" "}
            <span className="w arrive" style={{ ["--d" as string]: "0.36s" }}>
              trusted
            </span>
            <br />
            <em className="w arrive" style={{ ["--d" as string]: "0.45s" }}>
              everywhere.
            </em>
          </h1>
          <p className="arrive" style={{ ["--d" as string]: "0.56s" }}>
            One trust workflow for candidates, employers, verifiers, reviewers, and
            admins — build a verified skill profile, prove skills through assessments
            and reviews, and use that trust in hiring.
          </p>
          <div className="actions arrive" style={{ ["--d" as string]: "0.65s" }}>
            <Link className="main-cta" href={appLinks.register}>
              Create Your Passport <span aria-hidden="true">→</span>
            </Link>
            <Link className="text-cta" href="/#platform">
              Explore the Platform <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <div className="foot wrap arrive" style={{ ["--d" as string]: "0.76s" }}>
          <span>
            <b aria-hidden="true" />
            VERIFY CREDENTIALS · PROVE SKILLS · HIRE WITH TRUST
          </span>
          <span>
            CANDIDATES · EMPLOYERS · VERIFIERS · REVIEWERS · SUPER ADMIN · ORG ADMIN
          </span>
        </div>
      </div>
    </main>
  );
}
