// Centralized animation tokens. Every Motion / GSAP animation in the app should
// pull from here rather than hardcoding a duration or easing curve — see
// spec "Cinematic Animation & Interaction System" §44-45.

export const motionTokens = {
  durations: {
    instant: 0.12,
    fast: 0.22,
    normal: 0.4,
    slow: 0.8,
    cinematic: 1.4,
  },
  easing: {
    // Standard UI easing — snappy, no overshoot.
    standard: [0.4, 0, 0.2, 1] as [number, number, number, number],
    // Smooth content reveals.
    smooth: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    // Slow, deliberate — landing-page storytelling only.
    cinematic: [0.16, 1, 0.3, 1] as [number, number, number, number],
  },
  spring: {
    soft: { type: "spring" as const, stiffness: 120, damping: 20, mass: 0.6 },
    responsive: { type: "spring" as const, stiffness: 300, damping: 26, mass: 0.5 },
    heavy: { type: "spring" as const, stiffness: 180, damping: 24, mass: 1.1 },
  },
  stagger: {
    tight: 0.04,
    normal: 0.08,
    loose: 0.15,
  },
} as const;

/**
 * Priority order when deciding whether an animation belongs, per spec §46:
 * 1. User feedback  2. Information hierarchy  3. Navigation
 * 4. Storytelling    5. Atmosphere
 * If an animation doesn't serve one of these, it doesn't ship.
 */
