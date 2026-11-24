# SkillPassport Website

Next.js (App Router) marketing site for SkillPassport — interactive demos and a WebGL luminous-network homepage hero.

**Brand:** Verify Once. Be Trusted Everywhere.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build    # production build
npm start        # serve the Node server (contact API works)
npm run typecheck
```

Optional static export (no API routes): `npm run build:static` → `/out`.

## Routes

| Path | Page |
|------|------|
| `/` | Homepage + WebGL hero + platform sections |
| `/candidates` | Candidate solutions |
| `/employers` | Employer solutions |
| `/verifiers` | Verifier solutions |
| `/reviewers` | Expert reviewer solutions |
| `/enterprises` | Enterprise / org admin |
| `/ai` | AI capabilities + demos |
| `/trust` | Trust & governance |
| `/contact` | Contact form (API + optional DB/SMTP) |
| `/sign-in` | Sign-in demo |
| `/create-passport` | Passport demo |

## Project structure

```text
app/                 App Router pages + API (`*.api.ts`) + SEO
components/          layout, navigation, hero, sections, interactive, ui
data/                typed static content
hooks/               client hooks
lib/                 content, SEO, contact, db helpers
prisma/              schema + migrations
public/images/       logos
public/network/      homepage WebGL (`app.js`) + hero CSS
public/ui/           runtime media (e.g. reviewer clip)
styles/globals.css   design tokens + imports hero CSS
types/               shared TypeScript types
.github/workflows/   CI
```

## Homepage hero

Raw WebGL (no Three.js) draws the 3D node sphere on `<canvas id="network">`.  
`HomeHero` loads `/network/app.js`. Motion elsewhere uses `motion/react` and CSS.

## Env

Copy `.env.example` → `.env.local` (never commit secrets).

- `DATABASE_URL` — contact messages in Postgres (optional; JSONL fallback locally)
- SMTP vars — email delivery (optional)

## Notes

- Default build is a **server** app so `/api/contact` works.
- CI runs `typecheck` + `build` on push / PR.
