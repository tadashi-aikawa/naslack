/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./**/*.tsx", "node_modules/flowbite-react/lib/esm/**/*.js"],
  plugins: [require("flowbite/plugin")],
  theme: {
    extend: {
      width: {
        128: "32rem",
        144: "36rem",
        192: "48rem",
        256: "64rem"
      },
      fontSize: {
        xss: "0.65rem"
      }
    }
  }
}
