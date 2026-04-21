/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          pink: "#FE2C55",
          cyan: "#25F4EE",
          dark: "#161823",
          "dark-2": "#1f1f1f",
          "dark-3": "#2a2a2a",
          gray: "#F8F8F8",
          "gray-2": "#EBEBEB",
          "gray-3": "#B0B0B0",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
      },
      screens: {
        xs: "375px",
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "bounce-slow": "bounce 2s infinite",
        "heart-burst": "heart-burst 0.3s ease-in-out",
        "slide-up": "slide-up 0.3s ease-out",
        "fade-in": "fade-in 0.2s ease-in",
      },
      keyframes: {
        "heart-burst": {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.4)" },
          "100%": { transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(100%)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
