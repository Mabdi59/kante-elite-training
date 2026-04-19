module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', 'node_modules'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': ['error', { allowConstantExport: true }],
    // TypeScript handles unused-vars at compile time (noUnusedLocals/Params in tsconfig)
    '@typescript-eslint/no-unused-vars': 'off',
    // Allow explicit `any` in service/API layer
    '@typescript-eslint/no-explicit-any': 'off',
    // Allow non-null assertions common in React DOM code
    '@typescript-eslint/no-non-null-assertion': 'off',
    // Allow empty interfaces (used for props typing)
    '@typescript-eslint/no-empty-interface': 'off',
    // Prefer type imports — not enforced at lint level (tsc handles this)
    '@typescript-eslint/consistent-type-imports': 'off',
  },
}
