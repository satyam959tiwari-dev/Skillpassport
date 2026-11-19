"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { PrimaryNavMenu } from "@/components/navigation/PrimaryNavMenu";
import { cx } from "@/lib/utils";

type Props = {
  variant?: "hero" | "page";
};

export function SiteHeader({ variant = "page" }: Props) {
  const [open, setOpen] = useState(false);
  const [dropdown, setDropdown] = useState<string | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);
  const menuId = useId();

  const closeAll = () => {
    setOpen(false);
    setDropdown(null);
  };

  useEffect(() => {
    document.body.classList.toggle("menu-open", open);
    return () => document.body.classList.remove("menu-open");
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAll();
        headerRef.current
          ?.querySelector<HTMLButtonElement>(".sp-menu-toggle")
          ?.focus();
      }
    };
    const onPointerDown = (e: PointerEvent) => {
      if (!headerRef.current?.contains(e.target as Node)) closeAll();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, []);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1100) closeAll();
    };
    window.addEventListener("resize", onResize, { passive: true });
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <header
      ref={headerRef}
      className={cx(
        "sp-site-header relative z-[80] w-full",
        variant === "page" && "sp-site-header--page",
        variant === "hero" && "sp-site-header--hero",
        open && "is-open",
      )}
    >
      <div className={cx("sp-nav-bar wrap", open && "is-open")}>
        <Link
          className="brand shrink-0"
          href="/"
          aria-label="SkillPassport home"
          onClick={closeAll}
        >
          <Image
            src="/images/masterpiece-logo.png"
            alt="Masterpiece · skillpassport.ai"
            width={215}
            height={56}
            className="h-10 w-auto sm:h-12 md:h-[52px] lg:h-14"
            priority
          />
        </Link>

        <PrimaryNavMenu
          menuId={menuId}
          dropdown={dropdown}
          setDropdown={setDropdown}
          onNavigate={closeAll}
        />

        <span
          className="nav-cta sp-nav-cta sp-nav-cta--disabled"
          aria-disabled="true"
          title="Sign up demo coming soon"
        >
          Sign up <span aria-hidden="true">→</span>
        </span>

        <button
          className="sp-menu-toggle"
          type="button"
          aria-controls={menuId}
          aria-expanded={open}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={(e) => {
            e.stopPropagation();
            const next = !open;
            setOpen(next);
            if (!next) setDropdown(null);
          }}
        >
          <svg
            className={cx(open && "hidden")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M4 7h16M4 12h16M4 17h16" />
          </svg>
          <svg
            className={cx(!open && "hidden")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
          >
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <button
        type="button"
        className={cx("sp-nav-dimmer", open && "is-visible")}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={closeAll}
      />
    </header>
  );
}
