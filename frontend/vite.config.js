import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Base path for hosting under periyaruniversity.ac.in/placement_centre/
  base: process.env.VITE_BASE_PATH || '/placement_centre/',
  server: {
    port: 5173,
    proxy: {
      '/placement_api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
});
