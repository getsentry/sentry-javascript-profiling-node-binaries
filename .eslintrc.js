module.exports = {
  extends: ["@sentry-internal/sdk"],
  env: {
    node: true,
    es6: true,
  },
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2018,
    project: './tsconfig.json',
  },
  ignorePatterns: ['lib/**/*'],
  rules: {
    '@sentry-internal/sdk/no-class-field-initializers': 'off',
  },
  overrides: [
    {
      files: ['test/**'],
      parserOptions: {
        project: './tsconfig.test.json',
      },
      rules: {
        'no-console': 'off',
        '@typescript-eslint/no-var-requires': 'off',
      }
    },
  ],
};
