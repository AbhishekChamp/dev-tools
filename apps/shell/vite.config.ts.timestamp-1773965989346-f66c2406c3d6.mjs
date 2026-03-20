// vite.config.ts
import { defineConfig } from "file:///Users/abhishekr/Documents/Abhishek/Coderdeck/Portfolio_Projects/ai-agent/dev-tools-platform/node_modules/vite/dist/node/index.js";
import react from "file:///Users/abhishekr/Documents/Abhishek/Coderdeck/Portfolio_Projects/ai-agent/dev-tools-platform/node_modules/@vitejs/plugin-react/dist/index.js";
import federation from "file:///Users/abhishekr/Documents/Abhishek/Coderdeck/Portfolio_Projects/ai-agent/dev-tools-platform/node_modules/@originjs/vite-plugin-federation/dist/index.mjs";
import { VitePWA } from "file:///Users/abhishekr/Documents/Abhishek/Coderdeck/Portfolio_Projects/ai-agent/dev-tools-platform/node_modules/vite-plugin-pwa/dist/index.js";
import path from "path";
var __vite_injected_original_dirname = "/Users/abhishekr/Documents/Abhishek/Coderdeck/Portfolio_Projects/ai-agent/dev-tools-platform/apps/shell";
var isProd = process.env.NODE_ENV === "production";
function devToolResolver() {
  return {
    name: "dev-tool-resolver",
    enforce: "pre",
    resolveId(id) {
      const toolMappings = {
        "jsonFormatterApp/Tool": path.resolve(__vite_injected_original_dirname, "../json-formatter/src/Tool.tsx"),
        "regexTesterApp/Tool": path.resolve(__vite_injected_original_dirname, "../regex-tester/src/Tool.tsx"),
        "jwtDecoderApp/Tool": path.resolve(__vite_injected_original_dirname, "../jwt-decoder/src/Tool.tsx"),
        "base64ToolApp/Tool": path.resolve(__vite_injected_original_dirname, "../base64-tool/src/Tool.tsx"),
        "passwordGeneratorApp/Tool": path.resolve(__vite_injected_original_dirname, "../password-generator/src/Tool.tsx")
      };
      if (toolMappings[id]) {
        return toolMappings[id];
      }
      return null;
    }
  };
}
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // Dev mode tool resolver (before federation)
    ...!isProd ? [devToolResolver()] : [],
    // Only use module federation in production build
    ...isProd ? [federation({
      name: "shell",
      remotes: {
        jsonFormatterApp: "http://localhost:3001/assets/remoteEntry.js",
        regexTesterApp: "http://localhost:3002/assets/remoteEntry.js",
        jwtDecoderApp: "http://localhost:3003/assets/remoteEntry.js",
        base64ToolApp: "http://localhost:3004/assets/remoteEntry.js",
        passwordGeneratorApp: "http://localhost:3005/assets/remoteEntry.js"
      },
      shared: ["react", "react-dom", "framer-motion"]
    })] : [],
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"]
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "masked-icon.svg"],
      manifest: {
        name: "Dev Tools Platform",
        short_name: "DevTools",
        description: "A micro-frontend developer tools platform",
        theme_color: "#3b82f6",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        icons: [
          {
            src: "/icon-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "/icon-512x512.png",
            sizes: "512x512",
            type: "image/png"
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__vite_injected_original_dirname, "./src"),
      "@dev-tools/theme": path.resolve(__vite_injected_original_dirname, "../../packages/theme/src"),
      "@dev-tools/ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@dev-tools/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/src"),
      "@dev-tools/tool-sdk": path.resolve(__vite_injected_original_dirname, "../../packages/tool-sdk/src"),
      // Subpath imports for @dev-tools/ui
      "@dev-tools/ui/components": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src/components"),
      "@dev-tools/ui/hooks": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src/hooks"),
      "@dev-tools/ui/animations": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src/animations"),
      "@dev-tools/ui/utils": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src/utils")
    }
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 3e3,
    strictPort: true
  },
  preview: {
    port: 3e3,
    strictPort: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWJoaXNoZWtyL0RvY3VtZW50cy9BYmhpc2hlay9Db2RlcmRlY2svUG9ydGZvbGlvX1Byb2plY3RzL2FpLWFnZW50L2Rldi10b29scy1wbGF0Zm9ybS9hcHBzL3NoZWxsXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvVXNlcnMvYWJoaXNoZWtyL0RvY3VtZW50cy9BYmhpc2hlay9Db2RlcmRlY2svUG9ydGZvbGlvX1Byb2plY3RzL2FpLWFnZW50L2Rldi10b29scy1wbGF0Zm9ybS9hcHBzL3NoZWxsL3ZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9Vc2Vycy9hYmhpc2hla3IvRG9jdW1lbnRzL0FiaGlzaGVrL0NvZGVyZGVjay9Qb3J0Zm9saW9fUHJvamVjdHMvYWktYWdlbnQvZGV2LXRvb2xzLXBsYXRmb3JtL2FwcHMvc2hlbGwvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIHR5cGUgUGx1Z2luIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IGZlZGVyYXRpb24gZnJvbSAnQG9yaWdpbmpzL3ZpdGUtcGx1Z2luLWZlZGVyYXRpb24nO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuLy8gQ2hlY2sgaWYgd2UncmUgaW4gcHJvZHVjdGlvbiBidWlsZCBtb2RlXG5jb25zdCBpc1Byb2QgPSBwcm9jZXNzLmVudi5OT0RFX0VOViA9PT0gJ3Byb2R1Y3Rpb24nO1xuXG4vLyBDdXN0b20gcGx1Z2luIHRvIHJlc29sdmUgdG9vbCBpbXBvcnRzIGluIGRldiBtb2RlXG5mdW5jdGlvbiBkZXZUb29sUmVzb2x2ZXIoKTogUGx1Z2luIHtcbiAgcmV0dXJuIHtcbiAgICBuYW1lOiAnZGV2LXRvb2wtcmVzb2x2ZXInLFxuICAgIGVuZm9yY2U6ICdwcmUnLFxuICAgIHJlc29sdmVJZChpZCkge1xuICAgICAgLy8gTWFwIHRvb2wgaW1wb3J0cyB0byB0aGVpciBzb3VyY2UgZmlsZXMgaW4gZGV2IG1vZGVcbiAgICAgIGNvbnN0IHRvb2xNYXBwaW5nczogUmVjb3JkPHN0cmluZywgc3RyaW5nPiA9IHtcbiAgICAgICAgJ2pzb25Gb3JtYXR0ZXJBcHAvVG9vbCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9qc29uLWZvcm1hdHRlci9zcmMvVG9vbC50c3gnKSxcbiAgICAgICAgJ3JlZ2V4VGVzdGVyQXBwL1Rvb2wnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vcmVnZXgtdGVzdGVyL3NyYy9Ub29sLnRzeCcpLFxuICAgICAgICAnand0RGVjb2RlckFwcC9Ub29sJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2p3dC1kZWNvZGVyL3NyYy9Ub29sLnRzeCcpLFxuICAgICAgICAnYmFzZTY0VG9vbEFwcC9Ub29sJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uL2Jhc2U2NC10b29sL3NyYy9Ub29sLnRzeCcpLFxuICAgICAgICAncGFzc3dvcmRHZW5lcmF0b3JBcHAvVG9vbCc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi9wYXNzd29yZC1nZW5lcmF0b3Ivc3JjL1Rvb2wudHN4JyksXG4gICAgICB9O1xuICAgICAgXG4gICAgICBpZiAodG9vbE1hcHBpbmdzW2lkXSkge1xuICAgICAgICByZXR1cm4gdG9vbE1hcHBpbmdzW2lkXTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbn1cblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgLy8gRGV2IG1vZGUgdG9vbCByZXNvbHZlciAoYmVmb3JlIGZlZGVyYXRpb24pXG4gICAgLi4uKCFpc1Byb2QgPyBbZGV2VG9vbFJlc29sdmVyKCldIDogW10pLFxuICAgIC8vIE9ubHkgdXNlIG1vZHVsZSBmZWRlcmF0aW9uIGluIHByb2R1Y3Rpb24gYnVpbGRcbiAgICAuLi4oaXNQcm9kID8gW2ZlZGVyYXRpb24oe1xuICAgICAgbmFtZTogJ3NoZWxsJyxcbiAgICAgIHJlbW90ZXM6IHtcbiAgICAgICAganNvbkZvcm1hdHRlckFwcDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMS9hc3NldHMvcmVtb3RlRW50cnkuanMnLFxuICAgICAgICByZWdleFRlc3RlckFwcDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMi9hc3NldHMvcmVtb3RlRW50cnkuanMnLFxuICAgICAgICBqd3REZWNvZGVyQXBwOiAnaHR0cDovL2xvY2FsaG9zdDozMDAzL2Fzc2V0cy9yZW1vdGVFbnRyeS5qcycsXG4gICAgICAgIGJhc2U2NFRvb2xBcHA6ICdodHRwOi8vbG9jYWxob3N0OjMwMDQvYXNzZXRzL3JlbW90ZUVudHJ5LmpzJyxcbiAgICAgICAgcGFzc3dvcmRHZW5lcmF0b3JBcHA6ICdodHRwOi8vbG9jYWxob3N0OjMwMDUvYXNzZXRzL3JlbW90ZUVudHJ5LmpzJyxcbiAgICAgIH0sXG4gICAgICBzaGFyZWQ6IFsncmVhY3QnLCAncmVhY3QtZG9tJywgJ2ZyYW1lci1tb3Rpb24nXSxcbiAgICB9KV0gOiBbXSksXG4gICAgVml0ZVBXQSh7XG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcbiAgICAgIHdvcmtib3g6IHtcbiAgICAgICAgZ2xvYlBhdHRlcm5zOiBbJyoqLyoue2pzLGNzcyxodG1sLGljbyxwbmcsc3ZnfSddLFxuICAgICAgfSxcbiAgICAgIGluY2x1ZGVBc3NldHM6IFsnZmF2aWNvbi5pY28nLCAnYXBwbGUtdG91Y2gtaWNvbi5wbmcnLCAnbWFza2VkLWljb24uc3ZnJ10sXG4gICAgICBtYW5pZmVzdDoge1xuICAgICAgICBuYW1lOiAnRGV2IFRvb2xzIFBsYXRmb3JtJyxcbiAgICAgICAgc2hvcnRfbmFtZTogJ0RldlRvb2xzJyxcbiAgICAgICAgZGVzY3JpcHRpb246ICdBIG1pY3JvLWZyb250ZW5kIGRldmVsb3BlciB0b29scyBwbGF0Zm9ybScsXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzNiODJmNicsXG4gICAgICAgIGJhY2tncm91bmRfY29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgZGlzcGxheTogJ3N0YW5kYWxvbmUnLFxuICAgICAgICBzY29wZTogJy8nLFxuICAgICAgICBzdGFydF91cmw6ICcvJyxcbiAgICAgICAgaWNvbnM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICcvaWNvbi0xOTJ4MTkyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzE5MngxOTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgfSxcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzcmM6ICcvaWNvbi01MTJ4NTEyLnBuZycsXG4gICAgICAgICAgICBzaXplczogJzUxMng1MTInLFxuICAgICAgICAgICAgdHlwZTogJ2ltYWdlL3BuZycsXG4gICAgICAgICAgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi9zcmMnKSxcbiAgICAgICdAZGV2LXRvb2xzL3RoZW1lJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3RoZW1lL3NyYycpLFxuICAgICAgJ0BkZXYtdG9vbHMvdWknOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvdWkvc3JjJyksXG4gICAgICAnQGRldi10b29scy91dGlscyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy91dGlscy9zcmMnKSxcbiAgICAgICdAZGV2LXRvb2xzL3Rvb2wtc2RrJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3Rvb2wtc2RrL3NyYycpLFxuICAgICAgLy8gU3VicGF0aCBpbXBvcnRzIGZvciBAZGV2LXRvb2xzL3VpXG4gICAgICAnQGRldi10b29scy91aS9jb21wb25lbnRzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3VpL3NyYy9jb21wb25lbnRzJyksXG4gICAgICAnQGRldi10b29scy91aS9ob29rcyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy91aS9zcmMvaG9va3MnKSxcbiAgICAgICdAZGV2LXRvb2xzL3VpL2FuaW1hdGlvbnMnOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvdWkvc3JjL2FuaW1hdGlvbnMnKSxcbiAgICAgICdAZGV2LXRvb2xzL3VpL3V0aWxzJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3VpL3NyYy91dGlscycpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICBtaW5pZnk6IGZhbHNlLFxuICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IDMwMDAsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUF1ZSxTQUFTLG9CQUFpQztBQUNqaEIsT0FBTyxXQUFXO0FBQ2xCLE9BQU8sZ0JBQWdCO0FBQ3ZCLFNBQVMsZUFBZTtBQUN4QixPQUFPLFVBQVU7QUFKakIsSUFBTSxtQ0FBbUM7QUFPekMsSUFB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
