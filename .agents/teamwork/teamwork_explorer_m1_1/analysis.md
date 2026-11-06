# Styling & Theme Architecture Analysis for Milestone 1

## Executive Summary
This analysis establishes the complete token definitions, CSS variables, Tailwind configuration extensions, and component utility classes required to deliver the premium dark SCADA Operations Center aesthetic requested in **R1** (modeled after the reference design `media_1793984033843_2147cf5e.jpg`).

The architecture achieves two critical objectives simultaneously:
1. **Visual Fidelity**: Exact implementation of deep matte black/charcoal surfaces (`#070B09`, `#0D1411`, `#111A16`, `#15221C`), subtle dark emerald borders (`#1A2821`, `#1F3328`), solid neon mint active pills (`#00F59B` with high-contrast text `#050B08` and glow shadow `0 0 12px rgba(0,245,155,0.35)`), and alarm red accents (`#FF4D4D`).
2. **Zero-Breakage Compatibility**: Full backward compatibility with Radix UI and shadcn/ui semantic tokens (`--background`, `--card`, `--primary`, `--border`, etc.), while preserving the existing `industrial.*` Tailwind tokens as a bridge for legacy components during iterative refactoring.

---

## 1. Reference Design & Aesthetic Deconstruction

Analysis of reference asset `media_1793984033843_2147cf5e.jpg` reveals key design properties:

| Visual Element | Hex Color | Role / Location | Visual Treatment |
|---|---|---|---|
| **Outer Canvas** | `#070B09` | Deepest base background | Matte black with slight forest/emerald tint |
| **Card / Surface Container** | `#0D1411` | Metric cards, telemetry containers, radial card | Dark charcoal-emerald flat matte surface |
| **Elevated Surface** | `#111A16` | Top search bar, profile chip, popovers, dropdowns | Slightly raised charcoal-emerald |
| **Nested / Recessed Surface** | `#15221C` | Input backgrounds, hover rows, inner gauges | Dark subtle recessed tint |
| **Default Border** | `#1A2821` | Card outlines, vertical hairline dividers | 1px subtle dark emerald outline |
| **Border Active / Hover** | `#1F3328` | Hovered cards, selected states, input focus | Lighter subtle emerald boundary |
| **Brand Neon Mint** | `#00F59B` | Active nav pill, positive trends, radial gauge stroke | Solid bright neon mint with luminous glow |
| **Secondary Emerald** | `#10B981` | Secondary accents, gauge track highlights | Deep saturated emerald green |
| **Active Pill Text** | `#050B08` | Text on active neon green buttons | Near-black charcoal for maximum contrast |
| **Primary Text** | `#ECFDF5` | Major numerical metrics, titles, header labels | High-readability crisp light mint-white |
| **Muted Text** | `#6E8277` | KPI sub-labels, timestamps, inactive nav links | Sage grey-green industrial secondary text |
| **Alarm Red Accent** | `#FF4D4D` | Unacknowledged alarms, negative deltas, alert pills | High-visibility emergency red with glow |
| **Alarm Background** | `#2A1215` | Alarm tag/badge container background | Deep dark crimson |
| **Alarm Border** | `#451A1D` | Alarm badge outline | Subtle dark crimson border |

---

## 2. HSL Token Formulation for `globals.css`

Tailwind CSS + shadcn/ui components compute their colors via `hsl(var(--<token>))`. The exact HSL values matching our hexadecimal palette are:

| Variable | Hex Origin | HSL Value | Description |
|---|---|---|---|
| `--background` | `#070B09` | `150 22% 4%` | Base shell canvas |
| `--foreground` | `#ECFDF5` | `152 81% 96%` | Crisp light text |
| `--card` | `#0D1411` | `154 21% 6%` | Primary card container surface |
| `--card-foreground`| `#ECFDF5` | `152 81% 96%` | Card body light text |
| `--popover` | `#111A16` | `153 21% 8%` | Popovers, tooltips, dialogs |
| `--popover-foreground` | `#ECFDF5` | `152 81% 96%` | Popover light text |
| `--primary` | `#00F59B` | `158 100% 48%` | Solid neon mint primary |
| `--primary-foreground` | `#050B08` | `150 38% 3%` | High-contrast dark text on neon |
| `--secondary` | `#111A16` | `153 21% 8%` | Elevated secondary surface |
| `--secondary-foreground` | `#ECFDF5` | `152 81% 96%` | Secondary light text |
| `--muted` | `#15221C` | `152 24% 11%` | Recessed containers & inputs |
| `--muted-foreground` | `#6E8277` | `147 8% 47%` | Muted sage-grey text |
| `--accent` | `#15221C` | `152 24% 11%` | Hover & active chip surface |
| `--accent-foreground` | `#00F59B` | `158 100% 48%` | Neon text on accent hover |
| `--destructive` | `#FF4D4D` | `0 100% 65%` | High-priority alarm red |
| `--destructive-foreground` | `#ECFDF5` | `152 81% 96%` | Text on destructive elements |
| `--border` | `#1A2821` | `150 21% 13%` | Dark emerald card borders & hairlines |
| `--input` | `#1A2821` | `150 21% 13%` | Form controls and search outlines |
| `--ring` | `#00F59B` | `158 100% 48%` | Neon focus rings |
| `--radius` | 14px | `0.875rem` | Rounded corners matching reference |

---

## 3. Tailwind Configuration Architecture (`tailwind.config.ts`)

The Tailwind extension introduces:
1. `scada.*`: Semantic tokens for all modern M1+ components (`bg-scada-bg`, `bg-scada-surface`, `text-scada-neon`, `border-scada-border`, `bg-scada-pill-active`, `text-scada-pill-text`, etc.).
2. `industrial.*`: Updated color bridge ensuring legacy components (`PlantOverview`, `DeviceDetail`, `Navbar`, etc.) automatically harmonize with the dark emerald palette without any code breakage.
3. `boxShadow`: Standardized glowing shadows (`shadow-scada-glow`, `shadow-scada-glow-lg`, `shadow-scada-alarm`, `shadow-scada-card`, `shadow-scada-pill`).
4. `keyframes` & `animation`: Glowing pulses and radar sweep animations for live SCADA telemetry.

### Complete Proposed `dashboard/tailwind.config.ts`

```typescript
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

        // Legacy bridge for existing components
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
        "scada-pill": "0 0 14px rgba(0, 245, 155, 0.45)",
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
```

---

## 4. Complete Proposed `dashboard/src/app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 150 22% 4%;            /* #070B09 Deep matte canvas */
    --foreground: 152 81% 96%;           /* #ECFDF5 Crisp light text */

    --card: 154 21% 6%;                  /* #0D1411 Primary container surface */
    --card-foreground: 152 81% 96%;      /* #ECFDF5 */

    --popover: 153 21% 8%;               /* #111A16 Elevated popover/card surface */
    --popover-foreground: 152 81% 96%;   /* #ECFDF5 */

    --primary: 158 100% 48%;             /* #00F59B Solid neon mint */
    --primary-foreground: 150 38% 3%;    /* #050B08 High-contrast dark pill text */

    --secondary: 153 21% 8%;             /* #111A16 Elevated secondary surface */
    --secondary-foreground: 152 81% 96%; /* #ECFDF5 */

    --muted: 152 24% 11%;                /* #15221C Nested container surface */
    --muted-foreground: 147 8% 47%;      /* #6E8277 Sage-grey muted text */

    --accent: 152 24% 11%;               /* #15221C Hover/accent surface */
    --accent-foreground: 158 100% 48%;   /* #00F59B Neon text on hover */

    --destructive: 0 100% 65%;           /* #FF4D4D Alarm red */
    --destructive-foreground: 152 81% 96%; /* #ECFDF5 */

    --border: 150 21% 13%;               /* #1A2821 Subtle dark emerald border */
    --input: 150 21% 13%;                /* #1A2821 Input border */
    --ring: 158 100% 48%;                /* #00F59B Neon focus ring */

    --radius: 0.875rem;                  /* 14px */
  }
}

body {
  background-color: #070B09;
  color: #ECFDF5;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  overflow-x: hidden;
}

/* Custom Technical SCADA Scrollbars */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #070B09;
}
::-webkit-scrollbar-thumb {
  background: #1A2821;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #1F3328;
}

@layer utilities {
  /* SCADA Glow Utilities */
  .scada-glow {
    box-shadow: 0 0 12px rgba(0, 245, 155, 0.35);
  }
  .scada-glow-lg {
    box-shadow: 0 0 24px rgba(0, 245, 155, 0.25);
  }
  .scada-glow-sm {
    box-shadow: 0 0 6px rgba(0, 245, 155, 0.40);
  }
  .scada-alarm-glow {
    box-shadow: 0 0 12px rgba(255, 77, 77, 0.40);
  }

  /* Active Navigation Solid Neon Pill */
  .scada-pill-active {
    background-color: #00F59B;
    color: #050B08;
    font-weight: 600;
    box-shadow: 0 0 14px rgba(0, 245, 155, 0.40);
  }

  /* Alarm Badge Pill */
  .scada-badge-alarm {
    background-color: #FF4D4D;
    color: #FFFFFF;
    box-shadow: 0 0 8px rgba(255, 77, 77, 0.50);
  }
}
```

---

## 5. Complete Proposed `dashboard/src/app/layout.tsx`

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ENSAM IIoT SCADA Operations Center",
  description: "End-to-End Industrial IoT Pipeline & Operations Center — ENSAM Rabat Industrie 4.0",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-scada-bg text-scada-text antialiased selection:bg-scada-neon selection:text-scada-pill-text">
        {children}
      </body>
    </html>
  );
}
```

---

## 6. Radix UI & shadcn/ui Compatibility Verification

1. **Radix Primitives Checked**:
   - `@radix-ui/react-dialog`: Modals will inherit `--popover` (`#111A16`) and `--border` (`#1A2821`) with `--ring` (`#00F59B`).
   - `@radix-ui/react-select`: Dropdown items use `--accent` (`#15221C`) and `--accent-foreground` (`#00F59B`), creating seamless hover states.
   - `@radix-ui/react-tabs`: Tabs list and active triggers inherit `--card` and `--primary`.
   - `@radix-ui/react-tooltip`: Tooltip content surfaces inherit `--popover` and crisp light text.
2. **CVA and Tailwind Merge**:
   - `cn()` in `lib/utils.ts` works with all new `scada-*` utility classes.
3. **No Class Collision**:
   - Standard shadcn classes (`bg-card`, `text-card-foreground`, `border-border`) map to matching HSL variables.
   - Dedicated `scada-*` utility classes allow explicit styling when customized UI elements (like the solid neon pill) are rendered.

---

## 7. Component Usage Guide for Downstream Implementers

### A. Solid Neon Active Navigation Pill
```tsx
<button
  className={cn(
    "flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all",
    isActive
      ? "bg-scada-pill-active text-scada-pill-text shadow-scada-glow"
      : "text-scada-text-muted hover:text-scada-text hover:bg-scada-surface-elevated"
  )}
>
  <Icon className={cn("w-4 h-4", isActive ? "text-scada-pill-text" : "text-scada-text-muted")} />
  <span>{item.label}</span>
  {badgeCount > 0 && (
    <span className="ml-auto bg-scada-alarm text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-scada-alarm">
      {badgeCount}
    </span>
  )}
</button>
```

### B. Horizontal KPI Metric Card with Hairline Dividers
```tsx
<div className="bg-scada-surface border border-scada-border rounded-2xl p-5 shadow-scada-card grid grid-cols-2 lg:grid-cols-4 gap-4">
  {metrics.map((m, idx) => (
    <div
      key={m.id}
      className={cn(
        "flex flex-col justify-between px-4 py-2",
        idx !== metrics.length - 1 && "lg:border-r lg:border-scada-border"
      )}
    >
      <span className="text-xs font-medium text-scada-text-muted">{m.label}</span>
      <span className="text-2xl font-bold font-mono text-scada-text tracking-tight my-1.5">
        {m.value}
      </span>
      <div className="flex items-center gap-1 text-xs font-semibold text-scada-neon">
        <span>↗</span>
        <span>{m.trend}</span>
      </div>
    </div>
  ))}
</div>
```

### C. Top Bar Search & Profile Card
```tsx
{/* Search Input */}
<div className="relative">
  <Search className="w-4 h-4 text-scada-text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
  <input
    type="text"
    placeholder="Search telemetry, equipment, alerts..."
    className="bg-scada-surface-elevated border border-scada-border text-scada-text placeholder:text-scada-text-muted rounded-full pl-9 pr-4 py-2 text-xs focus:outline-none focus:border-scada-neon focus:ring-1 focus:ring-scada-neon transition-all w-64"
  />
</div>

{/* Profile Card */}
<div className="flex items-center gap-3 bg-scada-surface-elevated border border-scada-border rounded-full pl-2 pr-4 py-1.5">
  <div className="w-7 h-7 rounded-full bg-scada-neon/20 border border-scada-neon flex items-center justify-center text-scada-neon text-xs font-bold">
    OP
  </div>
  <div className="text-left">
    <div className="text-xs font-semibold text-scada-text leading-none">Daniel James Potter</div>
    <div className="text-[10px] text-scada-text-muted font-mono leading-none mt-1">Lead Operator</div>
  </div>
  <ChevronDown className="w-3.5 h-3.5 text-scada-text-muted ml-1" />
</div>
```
