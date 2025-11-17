import { defineConfig } from 'vite';
import { resolve } from 'path';
import { copyFileSync, mkdirSync } from 'fs';

export default defineConfig({
  define: {
    // Polyfill Buffer for Ledger libraries
    'global': 'globalThis',
  },
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'src/popup/popup.html'),
        background: resolve(__dirname, 'src/background/service-worker.js'),
        content: resolve(__dirname, 'src/content/content-script.js'),
        inpage: resolve(__dirname, 'src/content/inpage-provider.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        dir: 'dist',
        // Prevent code splitting for service worker
        manualChunks: undefined
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: 'inline',
    // Inline all dependencies for service worker
    minify: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      'buffer': 'buffer/'
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      // Node.js global to browser globalThis
      define: {
        global: 'globalThis'
      }
    }
  },
  plugins: [
    {
      name: 'copy-manifest',
      writeBundle() {
        // Copy manifest.json
        copyFileSync('manifest.json', 'dist/manifest.json');

        // Copy assets folder
        mkdirSync('dist/assets/icons', { recursive: true });
        copyFileSync('assets/icons/icon-16.png', 'dist/assets/icons/icon-16.png');
        copyFileSync('assets/icons/icon-48.png', 'dist/assets/icons/icon-48.png');
        copyFileSync('assets/icons/icon-128.png', 'dist/assets/icons/icon-128.png');

        // Copy logos folder
        mkdirSync('dist/assets/logos', { recursive: true });
        copyFileSync('assets/logos/hex.png', 'dist/assets/logos/hex.png');
        copyFileSync('assets/logos/pls.png', 'dist/assets/logos/pls.png');
        copyFileSync('assets/logos/plsx.png', 'dist/assets/logos/plsx.png');
        copyFileSync('assets/logos/heart.png', 'dist/assets/logos/heart.png');
        copyFileSync('assets/logos/eth.png', 'dist/assets/logos/eth.png');
        copyFileSync('assets/logos/inc.svg', 'dist/assets/logos/inc.svg');
        copyFileSync('assets/logos/savant-192.png', 'dist/assets/logos/savant-192.png');
        copyFileSync('assets/logos/hexrewards-1000.png', 'dist/assets/logos/hexrewards-1000.png');
        copyFileSync('assets/logos/tkr.svg', 'dist/assets/logos/tkr.svg');
        copyFileSync('assets/logos/jdai.svg', 'dist/assets/logos/jdai.svg');
        copyFileSync('assets/logos/ricky.jpg', 'dist/assets/logos/ricky.jpg');
      }
    }
  ]
});
