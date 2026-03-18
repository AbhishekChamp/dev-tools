// vite.config.ts
import { defineConfig } from "file:///Users/abhishekr/Documents/Abhishek/Coderdeck/Portfolio_Projects/ai-agent/dev-tools-platform/node_modules/vite/dist/node/index.js";
import react from "file:///Users/abhishekr/Documents/Abhishek/Coderdeck/Portfolio_Projects/ai-agent/dev-tools-platform/node_modules/@vitejs/plugin-react/dist/index.js";
import federation from "file:///Users/abhishekr/Documents/Abhishek/Coderdeck/Portfolio_Projects/ai-agent/dev-tools-platform/node_modules/@originjs/vite-plugin-federation/dist/index.mjs";
import path from "path";
var __vite_injected_original_dirname = "/Users/abhishekr/Documents/Abhishek/Coderdeck/Portfolio_Projects/ai-agent/dev-tools-platform/apps/password-generator";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    federation({
      name: "passwordGeneratorApp",
      filename: "remoteEntry.js",
      exposes: {
        "./Tool": "./src/Tool.tsx"
      },
      shared: ["react", "react-dom", "framer-motion"]
    })
  ],
  resolve: {
    alias: {
      "@dev-tools/theme": path.resolve(__vite_injected_original_dirname, "../../packages/theme/src"),
      "@dev-tools/ui": path.resolve(__vite_injected_original_dirname, "../../packages/ui/src"),
      "@dev-tools/utils": path.resolve(__vite_injected_original_dirname, "../../packages/utils/src"),
      "@dev-tools/tool-sdk": path.resolve(__vite_injected_original_dirname, "../../packages/tool-sdk/src")
    }
  },
  build: {
    target: "esnext",
    minify: false,
    cssCodeSplit: false
  },
  server: {
    port: 3005,
    strictPort: true
  },
  preview: {
    port: 3005,
    strictPort: true
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvYWJoaXNoZWtyL0RvY3VtZW50cy9BYmhpc2hlay9Db2RlcmRlY2svUG9ydGZvbGlvX1Byb2plY3RzL2FpLWFnZW50L2Rldi10b29scy1wbGF0Zm9ybS9hcHBzL3Bhc3N3b3JkLWdlbmVyYXRvclwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2FiaGlzaGVrci9Eb2N1bWVudHMvQWJoaXNoZWsvQ29kZXJkZWNrL1BvcnRmb2xpb19Qcm9qZWN0cy9haS1hZ2VudC9kZXYtdG9vbHMtcGxhdGZvcm0vYXBwcy9wYXNzd29yZC1nZW5lcmF0b3Ivdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2FiaGlzaGVrci9Eb2N1bWVudHMvQWJoaXNoZWsvQ29kZXJkZWNrL1BvcnRmb2xpb19Qcm9qZWN0cy9haS1hZ2VudC9kZXYtdG9vbHMtcGxhdGZvcm0vYXBwcy9wYXNzd29yZC1nZW5lcmF0b3Ivdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XG5pbXBvcnQgZmVkZXJhdGlvbiBmcm9tICdAb3JpZ2luanMvdml0ZS1wbHVnaW4tZmVkZXJhdGlvbic7XG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHJlYWN0KCksXG4gICAgZmVkZXJhdGlvbih7XG4gICAgICBuYW1lOiAncGFzc3dvcmRHZW5lcmF0b3JBcHAnLFxuICAgICAgZmlsZW5hbWU6ICdyZW1vdGVFbnRyeS5qcycsXG4gICAgICBleHBvc2VzOiB7XG4gICAgICAgICcuL1Rvb2wnOiAnLi9zcmMvVG9vbC50c3gnLFxuICAgICAgfSxcbiAgICAgIHNoYXJlZDogWydyZWFjdCcsICdyZWFjdC1kb20nLCAnZnJhbWVyLW1vdGlvbiddLFxuICAgIH0pLFxuICBdLFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAZGV2LXRvb2xzL3RoZW1lJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3RoZW1lL3NyYycpLFxuICAgICAgJ0BkZXYtdG9vbHMvdWknOiBwYXRoLnJlc29sdmUoX19kaXJuYW1lLCAnLi4vLi4vcGFja2FnZXMvdWkvc3JjJyksXG4gICAgICAnQGRldi10b29scy91dGlscyc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICcuLi8uLi9wYWNrYWdlcy91dGlscy9zcmMnKSxcbiAgICAgICdAZGV2LXRvb2xzL3Rvb2wtc2RrJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJy4uLy4uL3BhY2thZ2VzL3Rvb2wtc2RrL3NyYycpLFxuICAgIH0sXG4gIH0sXG4gIGJ1aWxkOiB7XG4gICAgdGFyZ2V0OiAnZXNuZXh0JyxcbiAgICBtaW5pZnk6IGZhbHNlLFxuICAgIGNzc0NvZGVTcGxpdDogZmFsc2UsXG4gIH0sXG4gIHNlcnZlcjoge1xuICAgIHBvcnQ6IDMwMDUsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgfSxcbiAgcHJldmlldzoge1xuICAgIHBvcnQ6IDMwMDUsXG4gICAgc3RyaWN0UG9ydDogdHJ1ZSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE4Z0IsU0FBUyxvQkFBb0I7QUFDM2lCLE9BQU8sV0FBVztBQUNsQixPQUFPLGdCQUFnQjtBQUN2QixPQUFPLFVBQVU7QUFIakIsSUFBTSxtQ0FBbUM7QUFLekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sV0FBVztBQUFBLE1BQ1QsTUFBTTtBQUFBLE1BQ04sVUFBVTtBQUFBLE1BQ1YsU0FBUztBQUFBLFFBQ1AsVUFBVTtBQUFBLE1BQ1o7QUFBQSxNQUNBLFFBQVEsQ0FBQyxTQUFTLGFBQWEsZUFBZTtBQUFBLElBQ2hELENBQUM7QUFBQSxFQUNIO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUCxPQUFPO0FBQUEsTUFDTCxvQkFBb0IsS0FBSyxRQUFRLGtDQUFXLDBCQUEwQjtBQUFBLE1BQ3RFLGlCQUFpQixLQUFLLFFBQVEsa0NBQVcsdUJBQXVCO0FBQUEsTUFDaEUsb0JBQW9CLEtBQUssUUFBUSxrQ0FBVywwQkFBMEI7QUFBQSxNQUN0RSx1QkFBdUIsS0FBSyxRQUFRLGtDQUFXLDZCQUE2QjtBQUFBLElBQzlFO0FBQUEsRUFDRjtBQUFBLEVBQ0EsT0FBTztBQUFBLElBQ0wsUUFBUTtBQUFBLElBQ1IsUUFBUTtBQUFBLElBQ1IsY0FBYztBQUFBLEVBQ2hCO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUEsSUFDTixZQUFZO0FBQUEsRUFDZDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLEVBQ2Q7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
