import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Moi request /api/... duoc chuyen tiep sang Backend (cong 5000) -> khong gap loi CORS.
const proxy = { '/api': { target: 'http://localhost:5000', changeOrigin: true } };

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy },
  preview: { port: 5173, proxy },
});
