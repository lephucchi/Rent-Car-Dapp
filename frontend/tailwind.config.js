export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "hsl(240 10% 3.9%)",
        foreground: "hsl(0 0% 98%)",
        primary: "hsl(263 70% 50%)",
        secondary: "hsl(240 4% 16%)",
        accent: "hsl(180 100% 50%)",
        neon: {
          cyan: "hsl(180 100% 50%)",
          purple: "hsl(263 70% 50%)",
          pink: "hsl(320 100% 70%)",
        },
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
