# SkillPassport — Home hero

A  network hero: a thick 3D shell of glowing nodes around a cloud of small white points, with soft background lights. Its structure, framing and motion follow the reference's own published scene (`hero-graph.js`), and were checked against a screen recording by optical flow. It has **no pointer or mouse interaction**, and **one motion only**: the camera orbits the sphere once every 180 s, swinging ±25° up and down once per orbit, so the loop is seamless and nothing runs on a clock of its own.

## Run (no installation)

Open `index.html` directly in a browser, or serve the folder locally. For example:

```bash
python -m http.server 5173
```

Then visit http://localhost:5173.

## How it renders

`src/app.js` uses raw WebGL (no Three.js, no build step):

1. **Sky**: the page's own ink (`#030508`, `--ink` in `style.css`), dithered so the bloom falloff does not band. No smoke or nebula, and no visible canvas edge.
2. **Structure**: 352 main shell nodes on a golden-angle spiral (evenly spaced, so the sphere reads round and clean), each linked to its 8 nearest (hubs 9); 260 smaller shell nodes on an offset spiral; 170 white interior points. Every shell node also links inward to the interior, so lines converge in bursts. Filaments are crisp ~1px quads with a faint glow; each mesh filament has a fixed lit stretch that turns with the sphere.
3. **Nodes and background lights**: nodes have a crisp core, a tight bloom and a soft halo; hubs breathe four times per orbit, read off the orbit angle. 104 large soft lights sit in a wide ring around the sphere; they are fixed in the world, so as the camera orbits they slide past at their own depth.

Each frame is then post-processed off-screen:

4. **Depth layers**: filaments and nodes are drawn twice, split by depth. The back half of the shell is blurred at quarter resolution, so far filaments read as soft haze, and the sharp front half sits on top.
5. **Bloom**: the brightest light is extracted, blurred at half resolution and added back, so glints, hubs and bright filaments spill a soft glow.

Render resolution is capped by `SETTINGS.pixelBudget` so the extra passes stay cheap on large or high-DPI screens.

If WebGL is unavailable, the CSS backdrop still shows and the page works normally.

## Where to change the look

`src/app.js` > `SETTINGS`: node counts, camera distance, focus/bokeh strength, spin speed, line opacity and colour, glow. `PALETTE` sets the node colour mix. `layout()` frames the sphere as the reference does: centred near the top of the hero, bleeding off the top and right. `period`, `tilt` and `phase` set the orbit. `src/style.css` `.copy-shade` controls the dark overlay behind the text, and `.hero::after` the fade into the next section. Page entrances all use one keyframe (`arrive`) and one spring curve (`--spring`), staggered with `--d` in `index.html`. With reduced-motion preferences, the network renders as a still frame.

## Notes

- This is an original reference-inspired design, not a copy of Neo4j's code or assets.
- Brand: the Masterpiece / skillspassport.ai logo (`assets/masterpiece-logo.png`) and icon (`assets/skillpassport-logo.png`), taken from the SkillPassport app. Copy follows the SkillPassport website brief and mockup; "Sign in" and "Create Your Passport" link to the live app login.
- The animation has no pointer listeners and no scroll-controlled movement (the only click handlers are the mobile menu's). Rendering pauses when the hero is off-screen or the tab is hidden.

## Brand theme

Colours and type follow the Masterpiece / skillspassport.ai sign-in page (sampled from it): navy `#090d33` to indigo `#161152` with a violet glow `#1c1261`, accent violets `#441eb6` / `#5224d4` / `#5f36c9`, the logo's blues `#62acfa` → `#3387f2` → `#1071fa`, and Roboto. They are tokens in `src/style.css` `:root` and apply to the page (background, type, buttons, accents). The network keeps its own colours (warm amber shell, white core, blue filaments): the canvas draws light on black and is added onto the hero background, which runs from brand navy behind the copy to near-black behind the sphere.

## Verified quality

Tested with Playwright across **Chromium, Firefox and WebKit** (the engines behind Chrome/Edge, Firefox, and Safari) on 18 device profiles from a 280px foldable to a 2560px monitor.

| Check | Result |
|---|---|
| Text contrast over the live animation (WCAG 1.4.3) | 45/45 configs pass; tightest margin 5.28:1 against a 4.5:1 requirement |
| Layout, overflow, nav collisions, console errors | 54/54 configs clean |
| Horizontal overflow swept at every width 320-2560px | none in any engine |
| Pointer target size (WCAG 2.5.8, 24x24) | all targets pass |
| Reflow at 200% and 400% zoom (WCAG 1.4.10) | no horizontal scroll in any engine |
| Text-only zoom to 200% (WCAG 1.4.4) | no overflow |
| Forced colours (Windows High Contrast) | system palette applied, decorative canvas dropped |
| Mobile menu: slide-in drawer from the right | opens, dims the page, locks background scroll, moves focus, Escape and outside-click close, focus returns - all engines |
| CLS / LCP | 0.0008 / 504ms (targets 0.1 / 2500ms) |
| Render loop when hero is off-screen or reduced-motion | stops completely (0 frames), resumes on return |

Contrast is measured against the real animated background at two orbit positions, taking the 98th-percentile brightest pixel behind each line of text, so a bright node passing behind a word is accounted for.

Nav type follows the common SaaS standard: 16px menu and button on desktop (Neo4j's nav button is also 16px), 18px on touch tablets where the screen is held further away, 15px on phones.

## Responsive behaviour

Checked at 360×740, 390×844, 844×390, 768×1024, 1024×768, 1366×768, 1920×1080 and 2560×1440.

- **Desktop and landscape:** copy on the left, the sphere framed in the right 70%. Past 1792px the sphere, fade and ground are framed against the same centred stage as the content container, so they never drift apart on ultra-wide screens.
- **≤1100px:** the menu becomes a drawer that slides in from the right, dimming and locking the page behind it (`aria-expanded`, Esc and outside-click close, focus moves in and returns). Menu text and the Sign in button always share one size (`--nav-fs`).
- **Portrait tablets and phones:** the sphere sits above the copy and fades out before the text; buttons stack full-width; the announcement bar keeps to one line.
- **Footer:** four columns on desktop, two on tablets, one on phones.
