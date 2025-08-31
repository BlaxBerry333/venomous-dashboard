/** @type {import("prettier").Config} */
const prettierConfig = {
  plugins: [
    "prettier-plugin-organize-imports",
    "prettier-plugin-organize-attributes",
    "prettier-plugin-css-order",
    "prettier-plugin-style-order",
  ],

  printWidth: 160,
  singleQuote: false,
};

export default prettierConfig;
