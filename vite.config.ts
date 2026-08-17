import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { copyFileSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function spaFallback() {
  return {
    name: 'spa-github-pages-fallback',
    closeBundle() {
      const index = resolve('dist/index.html');
      if (existsSync(index)) {
        copyFileSync(index, resolve('dist/404.html'));
      }
    }
  };
}

// Project Pages URL: https://<user>.github.io/IdleCompanion/
const pagesBase = process.env.VITE_BASE_PATH ?? (process.env.NODE_ENV === 'production' ? '/IdleCompanion/' : '/');

export default defineConfig({
  base: pagesBase,
  plugins: [react(), spaFallback()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  test: {
    environment: 'jsdom',
    globals: false
  }
});
