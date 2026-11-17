import { defineConfig } from 'vitest/config';
import path from 'node:path';
export default defineConfig({
  esbuild: { loader: 'jsx', include: /(src|tests)\/.*\.jsx?$/, exclude: /node_modules/, jsx: 'automatic' },
  resolve: { alias: { '@': path.resolve('src') } },
  test: { environment: 'jsdom', include: ['tests/**/*.test.{js,jsx}'], setupFiles: ['tests/setup.js'] }
});
