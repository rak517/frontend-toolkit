import { defineConfig } from 'tsup';

export default defineConfig({
  entry: [
    'src/index.ts',
    'src/useQueryParams/adapters/next-app.ts',
    'src/useQueryParams/adapters/next-pages.ts',
    'src/useQueryParams/adapters/react-router.ts',
  ],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
    compilerOptions: {
      composite: false,
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  treeshake: true,
  minify: true,
  external: ['react', 'next', 'react-router-dom'],
});
