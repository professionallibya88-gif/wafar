import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      { find: '@/NotificationBell.vue', replacement: path.resolve(__dirname, 'src/components/NotificationBell.vue') },
      { find: '@/base', replacement: path.resolve(__dirname, 'src/components/base') },
      { find: '@/icons', replacement: path.resolve(__dirname, 'src/components/icons') },
      { find: '@/layout', replacement: path.resolve(__dirname, 'src/components/layout') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ]
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return;

          if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
            return 'vendor-vue';
          }

          if (id.includes('@heroicons')) {
            return 'vendor-icons';
          }

          if (id.includes('axios')) {
            return 'vendor-axios';
          }

          if (id.includes('three')) {
            return 'vendor-three';
          }

          return 'vendor-misc';
        },
      },
    },
  },
  server: {
    port: 3050,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true
      },
      '/uploads': {
        target: 'http://127.0.0.1:5050',
        changeOrigin: true
      }
    }
  }
});
