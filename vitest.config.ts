import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['packages/*/src/**/*.test.{ts,tsx}'],
    exclude: ['packages/*/src/__tests__/fixtures/**'],
    coverage: {
      provider: 'v8',
      include: ['packages/*/src/**/*.{ts,tsx}'],
      exclude: [
        'packages/*/src/**/*.test.{ts,tsx}',
        'packages/*/src/**/index.ts',
        'packages/*/src/**/types/**',
        'apps/**',
      ],
    },
  },
});
