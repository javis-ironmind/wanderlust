import type { Config } from "tailwindcss";
import { fontFamily } from "tailwindcss/defaultTheme";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        // PRD Color Palette
        primary: {
          DEFAULT: "#1E3A5F",
          50: "#E8EDF3",
          100: "#C5D3E3",
          200: "#9FB5CD",
          300: "#7897B7",
          400: "#5A7FA8",
          500: "#1E3A5F",
          600: "#1A3354",
          700: "#162B49",
          800: "#12233E",
          900: "#0E1B33",
        },
        secondary: {
          DEFAULT: "#F97316",
          50: "#FFF4E6",
          100: "#FFE4CC",
          200: "#FFCN99",
          300: "#FFB366",
          400: "#FF9A33",
          500: "#F97316",
          600: "#E66714",
          700: "#CC5A12",
          800: "#B34D10",
          900: "#99400D",
        },
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        surface: "#FFFFFF",
        "text-primary": "#1F2937",
        "text-secondary": "#6B7280",
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
        radius: "hsl(var(--radius))",
        // Editorial Wanderer Design System
        "primary-wanderer": "#9b3f25",
        "secondary-wanderer": "#5c614d",
        "tertiary-wanderer": "#735737",
        "surface-wanderer": "#f4faff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#e7f6ff",
        "surface-container": "#e0f0fb",
        "surface-container-high": "#daebf5",
        "surface-container-highest": "#d5e5ef",
        "surface-dim": "#ccdce7",
        "surface-variant": "#d5e5ef",
        "on-surface": "#0e1d25",
        "on-surface-variant": "#56423d",
        "outline-variant": "#ddc0b9",
        "tertiary-container": "#8e6f4e",
        "tertiary-fixed": "#ffddbb",
        "tertiary-fixed-dim": "#e5c099",
        "secondary-container": "#e0e5cc",
        "secondary-fixed": "#e0e5cc",
        "secondary-fixed-dim": "#c4c9b1",
        "primary-fixed": "#ffdbd1",
        "primary-fixed-dim": "#ffb5a1",
        "primary-container": "#bb563b",
        "surface-tint": "#9e4127",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...fontFamily.sans],
        serif: ["Noto Serif", "Georgia", "serif"],
        wanderer: ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
