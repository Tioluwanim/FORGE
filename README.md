# FORGE — Frontend (Phase 1)

Full frontend for the FORGE learning platform: all 27 routes from the product
spec, the shared component/design system, and the cinematic animation system.
No backend — everything runs on mock data in `src/lib/mock-data.ts` until the
FastAPI backend from `forge-architecture-plan.md` exists.

## Setup

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

> **This has not been run or built in the sandbox that generated it.**
> `npm install` was blocked there (registry access returned 403 despite being
> an allowed host — worth checking your own network/proxy settings if you see
> the same). Every file was hand-written against documented, current APIs and
> cross-checked against source docs where the API surface was uncertain (Lenis
> + GSAP sync, in particular), but run `npm run build` and `npm run lint`
> immediately after install and expect to fix a handful of small things —
> especially around the Lenis React ref typing in
> `components/motion/smooth-scroll-provider.tsx`, which was written defensively
> because its exact exported TS type couldn't be verified without a real
> install.

## Routes (spec §26 — all present)

**Marketing** — `/`, `/pricing`, `/about`, `/method`, `/tracks`
**Auth** — `/login`, `/signup`, `/onboarding`, `/select-language`
**App** — `/dashboard`, `/roadmap`, `/learn`, `/learn/[concept]`, `/documentation`, `/practice`, `/challenge/[id]`, `/challenge/[id]/results`, `/projects`, `/projects/[id]`, `/projects/[id]/workspace`, `/debug`, `/production`, `/system-design`, `/progress`, `/reviews`, `/ai-mentor`
**Account** — `/settings`, `/settings/profile`, `/settings/preferences`, `/settings/security`

## Structure

```
src/
├── app/
│   ├── (marketing)/    # landing + pricing/about/method/tracks, Lenis+GSAP mounted here
│   ├── (auth)/          # login/signup/onboarding/select-language, centered card layout
│   └── (app)/            # sidebar + topbar + command palette shell, template.tsx = page transitions
├── components/
│   ├── ui/                 # generic primitives (Button, Card, Badge, MasteryRing)
│   ├── lab/                 # FORGE-specific (Sidebar, RoadmapNode, TestResultRow, CodeEditor, MentorPanel, ...)
│   └── motion/               # the animation system (see below)
└── lib/
    ├── mock-data.ts          # all seed/mock content
    ├── motion-tokens.ts       # durations/easing/spring — single source of truth
    └── cn.ts
```

## Animation system

Built to the "Cinematic Animation & Interaction System" spec's stack and
route-level strategy (§42):

| Layer | Library | Used for |
|---|---|---|
| Primary UI motion | `motion` (the renamed Framer Motion — `import from "motion/react"`) | entrances, hover/tap, layout, `AnimatePresence`, drag |
| Scroll storytelling | `gsap` + `ScrollTrigger` | the pinned WATCH→MASTER sequence, the scroll-assembled architecture diagram |
| Smooth scroll | `lenis` (`lenis/react`) | landing page only, driven through GSAP's ticker so ScrollTrigger stays in sync |
| 3D | `three` + `@react-three/fiber` + `@react-three/drei` | hero-only floating code fragments + particle sparkles, dynamically imported (`ssr: false`), never mounted elsewhere |

**Route-level loading** — Lenis/GSAP/R3F only ever load on `/` (via the
`(marketing)` layout and the landing page's dynamic `HeroScene` import). Every
other route uses `motion` alone, matching the spec's per-route budget so app
pages stay light.

**Reusable primitives** in `components/motion/`:
`Reveal`, `Stagger`/`StaggerItem`, `LineReveal`/`WordReveal`, `MagneticButton`,
`TiltCard`, `AnimatedNumber`, `ScrollProgress`, `PageTransition`,
`LoadingState`/`ThinkingIndicator`, `GridBackground`/`GlowField`/`ParticleField`/`NoiseOverlay`,
`CustomCursor`, `SmoothScrollProvider`, `ArchitectureDiagram`, `ScrollStory`.

**Reduced motion** — every primitive checks `useReducedMotion()` and either
disables movement or falls back to instant/opacity-only transitions. Lenis and
the custom cursor fully no-op when reduced motion is on or on touch devices.

**What's deliberately not done**: full drag-and-drop physics/snapping on the
system design canvas (it uses Motion's native `drag`, which works, but has no
grid-snap or connection-line validation yet), a real streaming/typed AI mentor
response (currently a `setTimeout` stand-in), and Theatre.js / Rive (spec
explicitly says: only add if the project actually needs the extra
choreography — nothing here does yet).

## Not built yet

- Wiring to the real FastAPI backend (`forge-architecture-plan.md`) — everything reads from `mock-data.ts`
- Real Monaco editor (currently a styled `<textarea>` placeholder in `CodeEditor` — swap for a `next/dynamic` import of `@monaco-editor/react` per the plan doc's §3.2 reasoning)
- Auth logic (forms are UI-only, no real request wiring)
- Real sandbox execution polling (the challenge page simulates a test run with `setTimeout`)

## Next step

Wire `(app)` pages to real data via TanStack Query once the backend exists,
starting with `auth` → `tracks` → `dashboard`, per the architecture plan's own
phase ordering.
