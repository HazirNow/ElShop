/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  build: {
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Node modules vendor splitting
          if (id.includes('node_modules')) {
            if (id.includes('react/') || id.includes('react-dom/')) {
              return 'vendor-react';
            }
            if (id.includes('recharts') || id.includes('d3-') || id.includes('d3') || id.includes('internmap')) {
              return 'vendor-charts';
            }
            if (id.includes('motion') || id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            if (id.includes('dexie')) {
              return 'vendor-storage';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-icons';
            }
            if (id.includes('html5-qrcode')) {
              return 'vendor-scanner';
            }
          }
          // Application feature-based code splitting
          if (id.includes('src/components/AdminDashboard') || id.includes('src/components/admin/')) {
            return 'admin-dashboard';
          }
          if (id.includes('src/components/MerchantView')) {
            return 'merchant-view';
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/setupTests.ts',
  },
});
