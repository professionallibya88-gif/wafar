import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: [
      {
        find: '@/NotificationBell.vue',
        replacement: path.resolve(__dirname, 'src/components/NotificationBell.vue'),
      },
      { find: '@/base', replacement: path.resolve(__dirname, 'src/components/base') },
      { find: '@/icons', replacement: path.resolve(__dirname, 'src/components/icons') },
      { find: '@/layout', replacement: path.resolve(__dirname, 'src/components/layout') },
      { find: '@', replacement: path.resolve(__dirname, 'src') },
    ],
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
  },
});
