module.exports = {
  env: {
    browser: true,
    node: true,
    es2021: true,
  },
  extends: 'eslint:recommended',
  plugins: ['prettier'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules: {
    'no-console': 'off',
    'prettier/prettier': ['error'],
  },
};
