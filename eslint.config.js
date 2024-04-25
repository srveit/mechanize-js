import globals from 'globals'
import eslintPluginJsonc from 'eslint-plugin-jsonc'
import stylistic from '@stylistic/eslint-plugin'

export default [
  {
    ignores: ['docs/'],
  },
  ...eslintPluginJsonc.configs['flat/recommended-with-jsonc'],
  {
    files: ['*.json'],
  },
  {
    files: ['*.js'],
    plugins: {
      '@stylistic': stylistic,
    },
    rules: {
      '@stylistic/comma-dangle': ['error', 'always-multiline'],
    },
  },
  {
    languageOptions: {
      globals: globals.browser,
    },
  },
]
