import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,                    // allows you to use expect(), describe() without imports
    environment: 'jsdom',             // ← THIS IS THE KEY LINE
    setupFiles: './test/setup.ts', // or './setupTests.ts'
  },
});