import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
        // Base colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: {
          DEFAULT: "hsl(var(--background))",
          light: "hsl(var(--background-light))",
        },
        foreground: "hsl(var(--foreground))",
        
        // Primary - Teal #14B8A6
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        
        // Secondary - Orange #FB923C
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        
        // Dark Section - #1F2937
        "dark-section": {
          DEFAULT: "hsl(var(--dark-section))",
          foreground: "hsl(var(--dark-section-foreground))",
        },
        
        // Status colors
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        
        // UI colors
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        
        // Badge variants
        badge: {
          best: "hsl(var(--badge-best))",
          value: "hsl(var(--badge-value))",
          premium: "hsl(var(--badge-premium))",
          new: "hsl(var(--badge-new))",
          capacity: "hsl(var(--badge-capacity))",
        },
        
        // Performance scores
        perf: {
          excellent: "hsl(var(--perf-excellent))",
          good: "hsl(var(--perf-good))",
          average: "hsl(var(--perf-average))",
          poor: "hsl(var(--perf-poor))",
        },
        
        // Star ratings
        star: {
          filled: "hsl(var(--star-filled))",
          empty: "hsl(var(--star-empty))",
        },
        
        // Chart colors
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      
      // Border Radius - 0.75rem (xl) base for Shadcn
      borderRadius: {
        sm: "0.5rem",      // 8px
        DEFAULT: "0.625rem", // 10px
        md: "0.625rem",    // 10px
        lg: "0.75rem",     // 12px - base radius
        xl: "1rem",        // 16px
        "2xl": "1.5rem",   // 24px
        "3xl": "2rem",     // 32px
      },
      
      // Typography - Inter
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        heading: ["var(--font-inter)", "Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem" }],
      },
      
      // Spacing
      spacing: {
        "header": "var(--header-height)",
        "sidebar": "var(--sidebar-width)",
      },
      
      // Keyframes
      keyframes: {
        "accordion-down": {
          from: { height: "0", opacity: "0" },
          to: { height: "var(--radix-accordion-content-height)", opacity: "1" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)", opacity: "1" },
          to: { height: "0", opacity: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 5px hsl(var(--primary) / 0.5)" },
          "50%": {
            boxShadow: "0 0 20px hsl(var(--primary) / 0.8), 0 0 30px hsl(var(--primary) / 0.4)",
          },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      
      // Animations
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "slide-down": "slide-down 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "shimmer": "shimmer 2s linear infinite",
      },
      
      // Box shadows
      boxShadow: {
        "card": "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
        "card-hover": "0 12px 40px rgb(0 0 0 / 0.08)",
        "dropdown": "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
