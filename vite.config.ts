import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  // Enable importing of image assets and set up a clean alias for asset folder
  // This allows imports like import img from '@/posters/poster-1.png'
  // Tailwind will process the assets via Vite's default asset handling.
  // No additional plugin needed – Vite's assetsInclude handles .png, .jpg, .svg by default.

  return {
    // Enable Vite to treat image files as assets (png, jpg, svg, etc.)
    assetsInclude: ['**/*.png', '**/*.jpg', '**/*.svg'],
    // Optional: you can expose a custom public directory if needed
    // publicDir: 'public',

    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        },
        '/uploads': {
          target: 'http://localhost:3000',
          changeOrigin: true,
        }
      }
    },
  };
});
