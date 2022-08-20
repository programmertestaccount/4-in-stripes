module.exports = {
  env: {
    browser: true,
    es2021: true,
  },
  extends: ["airbnb", "prettier"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    "linebreak-style": 0,
    indent: ["error", 2],
    quotes: ["error", "double"],
    "prefer-destructuring": [
      "error",
      {
        array: false,
        object: true,
      },
    ],
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "always",
      },
    ],
  },
};
