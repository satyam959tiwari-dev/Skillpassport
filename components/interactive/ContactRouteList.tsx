"use client";

import { ChevronRight, Handshake, Layers, ShieldCheck, type LucideIcon } from "lucide-react";
import { chooseContactRoute, contactRoutes, type ContactRouteId } from "@/lib/contact-events";

const icons: Record<ContactRouteId, LucideIcon> = {
  product: Handshake,
  verification: ShieldCheck,
  enterprise: Layers,
};

/** Route shortcuts beside the form — each preselects the matching topic. */
export function ContactRouteList() {
  return (
    <div className="mt-8">
      <p className="text-xs font-medium tracking-[0.16em] text-[#bdb4ff] uppercase">Choose a route</p>
      <ul className="mt-3 space-y-2.5">
        {contactRoutes.map((r) => {
          const Icon = icons[r.id];
          return (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => chooseContactRoute(r.id)}
                className="group flex w-full items-center gap-3.5 rounded-2xl border border-[rgb(98_172_250/0.28)] bg-[linear-gradient(150deg,rgb(26_64_150/0.32),rgb(10_22_70/0.6))] px-4 py-3 text-left transition hover:border-[rgb(140_196_255/0.75)] hover:shadow-[0_0_24px_rgb(51_135_242/0.25)]"
              >
                <span className="sp-icon-tile !size-10 shrink-0">
                  <Icon className="size-5" aria-hidden />
                </span>
                <span className="flex-1">
                  <span className="block font-medium text-white">{r.label}</span>
                  <span className="mt-0.5 block text-sm text-[var(--color-muted)]">{r.hint}</span>
                </span>
                <ChevronRight className="size-5 text-[var(--color-sky)] transition group-hover:translate-x-1" aria-hidden />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
