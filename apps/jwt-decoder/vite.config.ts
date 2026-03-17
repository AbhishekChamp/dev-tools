import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'jwtDecoderApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Tool': './src/Tool.tsx',
      },
      shared: ['react', 'react-dom', 'framer-motion'],
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dev-tools/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@dev-tools/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@dev-tools/utils': path.resolve(__dirname, '../../packages/utils/src'),
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3003,
    strictPort: true,
  },
  preview: {
    port: 3003,
    strictPort: true,
  },
});
