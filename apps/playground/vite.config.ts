import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
  },
  resolve: {
    alias: {
      '@frontend-toolkit-js/hooks': path.resolve(
        __dirname,
        '../../packages/hooks/src'
      ),
      '@frontend-toolkit-js/components': path.resolve(
        __dirname,
        '../../packages/components/src'
      ),
      '@frontend-toolkit-js/utils': path.resolve(
        __dirname,
        '../../packages/utils/src'
      ),
    },
  },
});
