import Image from "next/image";
import Link from "next/link";
import { appLinks, footerPlatform, footerSolutions, siteTagline } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="footer-grid wrap">
        <div className="footer-brand">
          <Image
            src="/images/masterpiece-logo.png"
            alt="Masterpiece · skillpassport.ai"
            width={200}
            height={52}
            className="h-[52px] w-auto"
          />
          <strong>{siteTagline}</strong>
          <p>
            A verification-first talent platform connecting candidates, employers,
            verifier companies, reviewers, and admins in one trust workflow.
          </p>
        </div>
        <nav className="footer-col" aria-label="Solutions">
          <h3>SOLUTIONS</h3>
          <ul>
            {footerSolutions.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav className="footer-col" aria-label="Platform">
          <h3>PLATFORM</h3>
          <ul>
            {footerPlatform.map((link) => (
              <li key={link.href}>
                <Link href={link.href}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="footer-col">
          <h3>GET IN TOUCH</h3>
          <ul>
            <li>
              <a className="mail" href={appLinks.supportEmail}>
                support@skillpassport.com
              </a>
            </li>
            <li>
              <Link href="/contact/">Contact</Link>
            </li>
            <li>
              <Link href={appLinks.register}>Create Your Passport</Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="footer-base wrap">
        <span>© 2026 SkillPassport. All rights reserved.</span>
        <span>Verify credentials · Prove skills · Hire with trust</span>
      </div>
    </footer>
  );
}
