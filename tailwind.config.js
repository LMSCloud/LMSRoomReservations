const { tailwindTransform } = require("postcss-lit");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: {
    files: [
      "src/*.ts",
      "src/components/*.ts",
      "src/components/custom/*.ts",
      "src/extensions/*.ts",
      "src/lib/**/*.ts",
      "src/views/*.ts"

    ], transform: { ts: tailwindTransform }
  },
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],
  daisyui: {
    logs: false,
    themes: [
      "emerald",
    ],
  },
}
