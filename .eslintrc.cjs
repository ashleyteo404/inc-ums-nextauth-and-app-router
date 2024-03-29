/** @type {import("eslint").Linter.Config} */
const config = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
  ],
  rules: {
    // These opinionated rules are enabled in stylistic-type-checked above.
    // Feel free to reconfigure them to your own preference.
    "react-hooks/rules-of-hooks": "off",

    "react/react-in-jsx-scope": "off", // next.js does not require react in most components
    "react/prop-types": "off", // as long as TS strict mode is off this is not required
    "no-console": "off", // warn when using console statements
    "prettier/prettier": "off", // don't show prettier errors as it will be fixed when saved anyway
    "import/extensions": "off", // next.js does not require extensions
    "react/require-default-props": "off", // turn off defaultProps requirement
    "react/jsx-props-no-spreading": "off", // opinionated rule
    "no-underscore-dangle": "off", // opinionated rule
    "import/prefer-default-export": "off", // do not warn when not using default exports
    "no-void": "off", // allow using void
    // "react/function-component-definition": [
    //   "error",
    //   {
    //     namedComponents: "arrow-function",
    //     unnamedComponents: "arrow-function",
    //   },
    // ], // only allow defining components with arrow functions
    "react/jsx-filename-extension": [
      "error",
      {
        extensions: [".tsx"],
      },
    ], // only allow .tsx files
    "@typescript-eslint/prefer-optional-chain": "off",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-return": "off",
    "@typescript-eslint/array-type": "off",
    "@typescript-eslint/consistent-type-definitions": "off",
    "@typescript-eslint/no-empty-interface": "off",

    "@typescript-eslint/consistent-type-imports": [
      "off",
      {
        prefer: "type-imports",
        fixStyle: "inline-type-imports",
      },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/require-await": "off",
    "@typescript-eslint/no-misused-promises": [
      "error",
      {
        checksVoidReturn: { attributes: false },
      },
    ],
  },
};

module.exports = config;
