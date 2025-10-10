import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentGretaTagger } from "@questlabs/greta-tagger";

export default defineConfig({
  plugins: [componentGretaTagger(), react()],
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      external: [
        // Exclude Node.js modules that shouldn't be bundled for the browser
        'node:crypto',
        'node:fs',
        'node:path',
        'node:url',
        'node:util',
        'fs',
        'path',
        'crypto',
        'util',
        'url'
      ]
    }
  },
  define: {
    // Define globals to prevent Node.js module usage
    global: 'globalThis',
  },
  optimizeDeps: {
    exclude: [
      // Exclude problematic dependencies from pre-bundling
      'drizzle-orm/migrator'
    ]
  }
});