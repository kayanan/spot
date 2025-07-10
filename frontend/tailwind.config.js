// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    {
      pattern: /bg-(rose|emerald|slate|amber|indigo)-(100|200|300|400|500|600)/,
    }
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
