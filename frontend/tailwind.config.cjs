// tailwind.config.cjs
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: "hsl(210, 100%, 55%)",
        secondary: "hsl(260, 90%, 60%)",
        accent: "hsl(180, 80%, 55%)"
      },
      backdropBlur: {
        xs: "2px",
        sm: "4px",
        md: "8px"
      },
      boxShadow: {
        glow: "0 0 10px rgba(0,255,255,0.5), 0 0 20px rgba(0,255,255,0.3)"
      }
    }
  },
  plugins: []
};
