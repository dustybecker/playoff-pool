/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0F172A",
        surface: "#111827",
        border: "#1F2937",
        accent: "#22C55E",
        info: "#3B82F6",
        text: "#E5E7EB",
        muted: "#9CA3AF",
        danger: "#EF4444",
      },
    },
  },
  plugins: [],
};
