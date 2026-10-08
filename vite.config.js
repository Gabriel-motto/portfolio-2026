import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/portfolio-2026/',
  plugins: [react()],
  // three.js is its own lazily loaded chunk (~690 kB min, ~177 kB gzip), same weight as the CDN build it replaces
  build: { chunkSizeWarningLimit: 800 },
});
