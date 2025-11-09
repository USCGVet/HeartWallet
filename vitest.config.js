import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    pool: 'vmThreads',
    setupFiles: ['./tests/setup.js'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.config.js',
        'src/popup/popup.js', // UI code - would need E2E tests
        'src/background/service-worker.js', // Service worker - would need E2E tests
        'src/content/'
      ]
    },
    mockReset: true,
    restoreMocks: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
