import Link from "next/link";
import { cx } from "@/lib/utils";

type Props = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "ghost" | "outline";
  className?: string;
  external?: boolean;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
  external,
}: Props) {
  const styles =
    variant === "primary"
      ? "sp-btn-primary"
      : variant === "ghost"
        ? "sp-btn-ghost"
        : "inline-flex min-h-11 items-center justify-center rounded-lg border border-[var(--color-rule)] bg-white/5 px-5 text-[16px] font-medium transition hover:bg-white/10";

  // Hash / mailto / external: native anchors so same-page scroll and mail work reliably
  if (
    external ||
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("#")
  ) {
    return (
      <a
        href={href}
        className={cx(styles, className)}
        {...(href.startsWith("http")
          ? { target: "_blank", rel: "noopener noreferrer" }
          : {})}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={cx(styles, className)}>
      {children}
    </Link>
  );
}
