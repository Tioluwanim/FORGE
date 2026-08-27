import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0A0B",
        surface: "#131316",
        elevated: "#1B1B1F",
        hairline: "#26262B",
        text: {
          DEFAULT: "#F2F1EC",
          muted: "#8B8B93",
          faint: "#5A5A61",
        },
        ember: {
          DEFAULT: "#FF6A39",
          dim: "#B84E2A",
          glow: "#FF8F5E",
        },
        signal: {
          pass: "#4ADE80",
          fail: "#F87171",
          warn: "#FBBF24",
          info: "#60A5FA",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      borderRadius: {
        sm: "4px",
        DEFAULT: "6px",
        md: "8px",
        lg: "12px",
      },
      backgroundImage: {
        "forge-seam":
          "linear-gradient(90deg, transparent 0%, var(--tw-gradient-stops), transparent 100%)",
        "grid-pattern":
          "linear-gradient(to right, #FFFFFF08 1px, transparent 1px), linear-gradient(to bottom, #FFFFFF08 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "40px 40px",
      },
      keyframes: {
        "seam-sweep": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "seam-sweep": "seam-sweep 2.4s linear infinite",
        "fade-up": "fade-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
