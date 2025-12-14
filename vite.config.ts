import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Critical: Use relative paths for assets so they load on GitHub Pages subdirectories
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
});