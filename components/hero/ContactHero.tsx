"use client";

import { ChevronRight, Handshake, Layers, ShieldCheck, UserRound, UsersRound, Zap, type LucideIcon } from "lucide-react";
import { useId, useState } from "react";
import { chooseContactRoute, contactRoutes, type ContactRouteId } from "@/lib/contact-events";
import { cx } from "@/lib/utils";
import { AudienceHeroShell, PhoneOnly, ScaledStage, Wire, WireDefs, accentTitle, useHeroReducedMotion } from "./HeroKit";
import s from "./ContactHero.module.css";

const routeIcon: Record<ContactRouteId, LucideIcon> = {
  product: Handshake,
  verification: ShieldCheck,
  enterprise: Layers,
};

const twoLine: Record<ContactRouteId, [string, string]> = {
  product: ["Product &", "Partnerships"],
  verification: ["Verification &", "Reviews"],
  enterprise: ["Enterprise &", "Governance"],
};

/* Wires from the cube's right edge to each route card (stage coords) */
const wires: Record<ContactRouteId, string> = {
  product: "M462 250 C 530 250, 540 150, 612 150",
  verification: "M462 290 C 540 290, 560 290, 628 290",
  enterprise: "M462 330 C 530 330, 540 420, 612 420",
};

export function ContactHero() {
  const [hot, setHot] = useState<ContactRouteId | null>(null);

  const pick = (id: ContactRouteId) => {
    setHot(id);
    chooseContactRoute(id);
  };

  return (
    <AudienceHeroShell
      ariaLabel="Contact SkillPassport"
      eyebrow="Contact"
      columns="minmax(0, 47fr) minmax(0, 53fr)"
      title={
        <>
          <span className="block">The right conversation</span>
          <span className="block">starts with the</span>
          <span className="block">{accentTitle("SkillPassport team", "SkillPassport")}</span>
        </>
      }
      titleClassName={s.title}
      description="Questions about candidates, hiring, verification, reviews, AI, or enterprise governance? Our team is here to help you find the right path, fast."
      primaryCta={{ label: "Send a message", href: "#contact-form" }}
      secondaryCta={{ label: "Explore SkillPassport", href: "/" }}
      secondaryVariant="outline"
      extra={
        <div className={s.topics} role="group" aria-label="Choose a topic for your message">
          {contactRoutes.map((r) => {
            const Icon = routeIcon[r.id];
            return (
              <button
                key={r.id}
                type="button"
                className={cx(s.topic, hot === r.id && s.topicOn)}
                onClick={() => pick(r.id)}
                aria-label={`${r.label} — preselect this topic in the form`}
              >
                <Icon aria-hidden />
                <span>
                  {twoLine[r.id][0]}
                  <br />
                  {twoLine[r.id][1]}
                </span>
              </button>
            );
          })}
        </div>
      }
      scene={
        <div className={s.sceneCol}>
          <RoutingScene hot={hot} onPick={pick} />
          <PhoneOnly>
            <div className={s.phoneRoutes}>
              {contactRoutes.map((r) => {
                const Icon = routeIcon[r.id];
                return (
                  <button
                    key={r.id}
                    type="button"
                    className={cx(s.phoneRoute, hot === r.id && s.routeOn)}
                    onClick={() => pick(r.id)}
                  >
                    <Icon aria-hidden />
                    <span>
                      <b>{r.label}</b>
                      <small>{r.hint}</small>
                    </span>
                    <ChevronRight className={s.chev} aria-hidden />
                  </button>
                );
              })}
            </div>
          </PhoneOnly>
          <div className={s.assurances}>
            <span>
              <Zap aria-hidden /> Fast routing
            </span>
            <i aria-hidden />
            <span>
              <UserRound aria-hidden /> Human follow-up
            </span>
          </div>
        </div>
      }
    />
  );
}

function RoutingScene({ hot, onPick }: { hot: ContactRouteId | null; onPick: (id: ContactRouteId) => void }) {
  const reduce = useHeroReducedMotion();
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const w = `${uid}w`;

  return (
    <ScaledStage
      width={880}
      height={540}
      label="Message routing"
      className={s.stageWrap}
      focus={{ x: 120, y: 20, w: 400, h: 470 }}
    >
      <svg className={s.back} viewBox="0 0 880 540" aria-hidden>
        <WireDefs id={w} />
        <defs>
          <radialGradient id={`${uid}-disc`} cx="50%" cy="50%" r="50%">
            <stop offset="0" stopColor="#d6ecff" stopOpacity="0.95" />
            <stop offset="0.4" stopColor="#3387f2" stopOpacity="0.5" />
            <stop offset="1" stopColor="#1071fa" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${uid}-swoosh`} x1="0" x2="1">
            <stop offset="0" stopColor="#1071fa" stopOpacity="0" />
            <stop offset=".4" stopColor="#62acfa" stopOpacity=".9" />
            <stop offset="1" stopColor="#6a46e8" stopOpacity=".2" />
          </linearGradient>
        </defs>
        {/* sweeping arcs */}
        <path className={s.swoosh} stroke={`url(#${uid}-swoosh)`} d="M60 380 C 40 200, 200 40, 470 40 S 840 120, 860 60" />
        <path className={s.swooshThin} stroke={`url(#${uid}-swoosh)`} d="M90 420 C 70 240, 230 90, 480 80 S 820 150, 870 110" />
        {/* platform */}
        <ellipse cx="300" cy="420" rx="250" ry="48" className={s.disc1} />
        <ellipse cx="300" cy="410" rx="200" ry="36" className={cx(s.disc2, !reduce && s.dashSpin)} />
        <ellipse cx="300" cy="404" rx="160" ry="26" fill={`url(#${uid}-disc)`} />
        <ellipse cx="300" cy="402" rx="120" ry="16" className={s.discHot} />
        <g data-mhide>
          {contactRoutes.map((r, i) => (
            <g key={r.id} className={cx(s.wireG, hot === r.id && s.wireHot)}>
              <Wire id={w} reduce={reduce} d={wires[r.id]} dur={2.8 + i * 0.4} delay={i * 0.9} color="rgb(140 196 255 / 0.6)" width={1.6} />
            </g>
          ))}
        </g>
      </svg>

      {/* chat bubbles */}
      <div className={cx(s.bubbles, !reduce && s.bubbleBob)} aria-hidden>
        <span className={s.bubbleBack} />
        <span className={s.bubbleFront}>
          <i />
          <i />
          <i />
        </span>
      </div>

      {/* cube */}
      <div className={cx(s.cube, !reduce && s.cubeFloat)}>
        <span className={s.cubeEdge} aria-hidden />
        <UsersRound className={s.cubeIcon} aria-hidden />
        <p>
          Talk to the
          <br />
          right team
        </p>
      </div>

      {/* route cards */}
      {contactRoutes.map((r) => {
        const Icon = routeIcon[r.id];
        return (
          <button
            key={r.id}
            type="button"
            data-mhide
            className={cx(s.route, s[`route_${r.id}`], hot === r.id && s.routeOn)}
            onClick={() => onPick(r.id)}
            aria-label={`${r.label} — preselect this topic in the form`}
          >
            <Icon className={s.routeIcon} aria-hidden />
            <span className={s.routeLabel}>
              {twoLine[r.id][0]}
              <br />
              {twoLine[r.id][1]}
            </span>
            <span className={s.routeGo} aria-hidden>
              <ChevronRight />
            </span>
          </button>
        );
      })}
    </ScaledStage>
  );
}
