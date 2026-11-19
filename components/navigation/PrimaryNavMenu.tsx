"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { primaryNav } from "@/lib/content";
import { cx } from "@/lib/utils";

type Props = {
  dropdown: string | null;
  setDropdown: (label: string | null) => void;
  onNavigate: () => void;
  menuId: string;
};

export function PrimaryNavMenu({
  dropdown,
  setDropdown,
  onNavigate,
  menuId,
}: Props) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.replace(/\/$/, ""));
  };

  return (
    <nav id={menuId} className="sp-menu" aria-label="Primary">
      <span className="sp-menu-label" aria-hidden="true">
        MENU
      </span>

      {primaryNav.map((item) => {
        if (!item.children) {
          return (
            <Link
              key={item.label}
              href={item.href ?? "/"}
              className={cx(
                "sp-menu-link",
                isActive(item.href ?? "") && "is-active",
              )}
              onClick={onNavigate}
            >
              {item.label}
            </Link>
          );
        }

        const groupOpen = dropdown === item.label;
        const panelId = `${menuId}-${item.label.replace(/\s+/g, "-").toLowerCase()}`;

        return (
          <div key={item.label} className="sp-menu-group">
            <button
              type="button"
              className="sp-menu-link sp-menu-trigger"
              aria-expanded={groupOpen}
              aria-haspopup="menu"
              aria-controls={panelId}
              onClick={(e) => {
                e.stopPropagation();
                setDropdown(groupOpen ? null : item.label);
              }}
            >
              {item.label}
              <ChevronDown
                className={cx("size-4 shrink-0 transition", groupOpen && "rotate-180")}
                aria-hidden
              />
            </button>

            <div
              id={panelId}
              className="sp-dropdown"
              role="menu"
              hidden={!groupOpen}
              data-open={groupOpen ? "true" : "false"}
            >
              {item.children.map((child) => (
                <Link
                  key={child.href}
                  href={child.href}
                  role="menuitem"
                  className={cx(
                    "sp-dropdown-item",
                    isActive(child.href) && "is-active",
                  )}
                  onClick={onNavigate}
                >
                  <span className="sp-dropdown-title">{child.label}</span>
                  {child.description ? (
                    <span className="sp-dropdown-desc">{child.description}</span>
                  ) : null}
                </Link>
              ))}
            </div>
          </div>
        );
      })}
    </nav>
  );
}
