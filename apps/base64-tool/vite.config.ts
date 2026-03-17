import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    federation({
      name: 'base64ToolApp',
      filename: 'remoteEntry.js',
      exposes: {
        './Tool': './src/Tool.tsx',
      },
      shared: ['react', 'react-dom', 'framer-motion'],
    }),
  ],
  resolve: {
    alias: {
      '@dev-tools/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@dev-tools/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@dev-tools/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@dev-tools/tool-sdk': path.resolve(__dirname, '../../packages/tool-sdk/src'),
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3004,
    strictPort: true,
  },
  preview: {
    port: 3004,
    strictPort: true,
  },
});
