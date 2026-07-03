/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#1C1B19",
        paper: "#FAFAF8",
        surface: "#FFFFFF",
        line: "#E5E2DB",
        muted: "#84806F",
        primary: {
          DEFAULT: "#0F6B5C",
          dark: "#0A4F44",
          light: "#E4F1EE",
        },
        amber: {
          DEFAULT: "#E8A33D",
          dark: "#B87A20",
          light: "#FBF0DC",
        },
        danger: {
          DEFAULT: "#C4453A",
          light: "#FAE6E4",
        },
      },
      fontFamily: {
        display: ["Sora", "system-ui", "sans-serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"],
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28,27,25,0.04), 0 4px 12px rgba(28,27,25,0.04)",
      },
      borderRadius: {
        md2: "10px",
      },
    },
  },
  plugins: [],
};

