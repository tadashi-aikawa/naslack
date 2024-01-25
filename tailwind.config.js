/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.tsx"],
  plugins: [],
  theme: {
    extend: {
      width: {
        128: "32rem",
        144: "36rem",
        192: "48rem",
        256: "64rem",
      },
    },
  },
};
