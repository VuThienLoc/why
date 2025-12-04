import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    globals: true,                    // allows you to use expect(), describe() without imports
    environment: 'jsdom',             // ← THIS IS THE KEY LINE
    setupFiles: './test/setup.ts', // or './setupTests.ts'
  },
});