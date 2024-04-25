import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // include: ['lib/**/*.{test,spec}.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'clover', 'json'],
      exclude: ['docs/**', 'examples/**', '.eslintrc.cjs'],
    },
  },
})
