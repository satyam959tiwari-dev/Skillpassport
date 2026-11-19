# SkillPassport Website

Premium Next.js marketing site for SkillPassport — static, interactive demos, and a luminous-network homepage hero.

Homepage network hero: a thick 3D shell of glowing nodes around a cloud of small white points, with soft background lights. It has **no pointer or mouse interaction**, and **one motion only**: the camera orbits the sphere once every 180 s, swinging ±25° up and down once per orbit, so the loop is seamless.

**Brand message:** Verify Once. Be Trusted Everywhere.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # static export to /out
npm start       # serve the Next server build (optional)
```

## What is preserved

The original hero implementation remains intact:

- `index.html`
- `src/app.js` (WebGL luminous network)
- `src/style.css`
- `assets/`

The Next.js homepage ports that hero visually and behaviorally (same copy, motion, and network renderer via `public/network/`), then extends the site with full sections and audience pages.

## Routes

| Path | Page |
|------|------|
| `/` | Homepage + hero + platform sections |
| `/candidates` | Candidate solutions |
| `/employers` | Employer solutions |
| `/verifiers` | Verifier solutions |
| `/reviewers` | Expert reviewer solutions |
| `/enterprises` | Enterprise / org admin |
| `/ai` | AI capabilities + illustrative demos |
| `/trust` | Trust & governance |
| `/contact` | Demo contact form |

## Structure

```text
app/                 App Router pages + SEO (sitemap, robots)
components/          layout, navigation, hero, animation, sections, interactive, ui
data/                typed static content
hooks/               client hooks
lib/                 content access + SEO helpers
types/               shared TypeScript types
public/images/       logos
public/network/      hero WebGL + hero CSS used by the Next homepage
styles/globals.css   design tokens (synced with hero brand)
```

## Notes

- No real backend, auth, or database in this phase.
- Contact form and AI demos use local mock data and are clearly labeled as demo / illustrative.
- Static export is enabled (`output: "export"` in `next.config.ts`).
