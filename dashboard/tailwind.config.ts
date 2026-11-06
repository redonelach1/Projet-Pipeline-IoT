import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Shadcn UI base tokens
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",

        // SCADA Operations Center Design Tokens
        scada: {
          bg: "#070B09",
          surface: "#0D1411",
          "surface-elevated": "#111A16",
          "surface-nested": "#15221C",
          "surface-hover": "#172820",
          border: "#1A2821",
          "border-light": "#1F3328",
          neon: "#00F59B",
          "neon-hover": "#10B981",
          "neon-dim": "rgba(0, 245, 155, 0.12)",
          "neon-subtle": "rgba(0, 245, 155, 0.05)",
          "pill-active": "#00F59B",
          "pill-text": "#050B08",
          text: "#ECFDF5",
          "text-muted": "#6E8277",
          "text-subtle": "#94A39B",
          alarm: "#FF4D4D",
          "alarm-hover": "#EF4444",
          "alarm-bg": "#2A1215",
          "alarm-border": "#451A1D",
          warning: "#F59E0B",
          "warning-bg": "#261E0F",
          "warning-border": "#4D3B1C",
          info: "#06B6D4",
          "info-bg": "#0D2229",
          "info-border": "#15424D",
        },

        // Legacy bridge for existing views
        industrial: {
          dark: "#070B09",
          panel: "#0D1411",
          border: "#1A2821",
          subtle: "#15221C",
          emerald: "#00F59B",
          amber: "#F59E0B",
          rose: "#FF4D4D",
          cyan: "#00F59B",
          blue: "#3b82f6",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        "scada-glow": "0 0 12px rgba(0, 245, 155, 0.35)",
        "scada-glow-lg": "0 0 24px rgba(0, 245, 155, 0.25)",
        "scada-glow-sm": "0 0 6px rgba(0, 245, 155, 0.40)",
        "scada-alarm": "0 0 12px rgba(255, 77, 77, 0.40)",
        "scada-card": "0 4px 20px -2px rgba(0, 0, 0, 0.6)",
        "scada-pill": "0 0 20px rgba(0, 245, 155, 0.35)",
      },
      keyframes: {
        sweep: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        glowPulse: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 8px rgba(0, 245, 155, 0.6))" },
          "50%": { opacity: "0.6", filter: "drop-shadow(0 0 2px rgba(0, 245, 155, 0.2))" },
        },
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "radar-sweep": "sweep 4s linear infinite",
        "glow-pulse": "glowPulse 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
