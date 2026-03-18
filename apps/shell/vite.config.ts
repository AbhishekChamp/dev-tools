import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import federation from '@originjs/vite-plugin-federation';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// Check if we're in production build mode
const isProd = process.env.NODE_ENV === 'production';

// Custom plugin to resolve tool imports in dev mode
function devToolResolver(): Plugin {
  return {
    name: 'dev-tool-resolver',
    enforce: 'pre',
    resolveId(id) {
      // Map tool imports to their source files in dev mode
      const toolMappings: Record<string, string> = {
        'jsonFormatterApp/Tool': path.resolve(__dirname, '../json-formatter/src/Tool.tsx'),
        'regexTesterApp/Tool': path.resolve(__dirname, '../regex-tester/src/Tool.tsx'),
        'jwtDecoderApp/Tool': path.resolve(__dirname, '../jwt-decoder/src/Tool.tsx'),
        'base64ToolApp/Tool': path.resolve(__dirname, '../base64-tool/src/Tool.tsx'),
        'passwordGeneratorApp/Tool': path.resolve(__dirname, '../password-generator/src/Tool.tsx'),
      };
      
      if (toolMappings[id]) {
        return toolMappings[id];
      }
      return null;
    }
  };
}

export default defineConfig({
  plugins: [
    react(),
    // Dev mode tool resolver (before federation)
    ...(!isProd ? [devToolResolver()] : []),
    // Only use module federation in production build
    ...(isProd ? [federation({
      name: 'shell',
      remotes: {
        jsonFormatterApp: 'http://localhost:3001/assets/remoteEntry.js',
        regexTesterApp: 'http://localhost:3002/assets/remoteEntry.js',
        jwtDecoderApp: 'http://localhost:3003/assets/remoteEntry.js',
        base64ToolApp: 'http://localhost:3004/assets/remoteEntry.js',
        passwordGeneratorApp: 'http://localhost:3005/assets/remoteEntry.js',
      },
      shared: ['react', 'react-dom', 'framer-motion'],
    })] : []),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      },
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Dev Tools Platform',
        short_name: 'DevTools',
        description: 'A micro-frontend developer tools platform',
        theme_color: '#3b82f6',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@dev-tools/theme': path.resolve(__dirname, '../../packages/theme/src'),
      '@dev-tools/ui': path.resolve(__dirname, '../../packages/ui/src'),
      '@dev-tools/utils': path.resolve(__dirname, '../../packages/utils/src'),
      '@dev-tools/tool-sdk': path.resolve(__dirname, '../../packages/tool-sdk/src'),
      // Subpath imports for @dev-tools/ui
      '@dev-tools/ui/components': path.resolve(__dirname, '../../packages/ui/src/components'),
      '@dev-tools/ui/hooks': path.resolve(__dirname, '../../packages/ui/src/hooks'),
      '@dev-tools/ui/animations': path.resolve(__dirname, '../../packages/ui/src/animations'),
      '@dev-tools/ui/utils': path.resolve(__dirname, '../../packages/ui/src/utils'),
    },
  },
  build: {
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
  server: {
    port: 3000,
    strictPort: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
  },
});
