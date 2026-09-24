import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  resolve: {
    alias: {
      'react-aria/private/ssr/SSRProvider': path.resolve(__dirname, './src/utils/ssrProvider.jsx'),
      'react-aria/SSRProvider': path.resolve(__dirname, './src/utils/ssrProvider.jsx')
    }
  }
});
