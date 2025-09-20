import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Determine if we're in production and deployment mode
  const isProduction = mode === 'production';
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true' || process.env.NODE_ENV === 'production';
  
  // Base path configuration for GitHub Pages
  const basePath = isGitHubPages ? '/browser-lab-experiments/' : '/';
  
  console.log(`🔧 Vite Config - Mode: ${mode}, Production: ${isProduction}, GitHub Pages: ${isGitHubPages}, Base: ${basePath}`);
  
  return {
    base: basePath,
    server: {
      host: "::",
      port: 8080,
      strictPort: false, // Allow port fallback
      open: false, // Don't auto-open browser in CI
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger()
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false, // Disable sourcemaps for production
      minify: 'esbuild', // Fast minification
      target: 'esnext', // Modern browsers
      reportCompressedSize: false, // Speed up build
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          // Optimize chunking for better caching
          manualChunks: {
            vendor: ['react', 'react-dom'],
            matter: ['matter-js'],
            charts: ['recharts'],
            radix: ['@radix-ui/react-dialog', '@radix-ui/react-slot', '@radix-ui/react-toast']
          },
          // Consistent file naming
          entryFileNames: 'assets/[name].[hash].js',
          chunkFileNames: 'assets/[name].[hash].js',
          assetFileNames: 'assets/[name].[hash].[ext]'
        }
      }
    },
    // Environment variable handling
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
      'process.env.VITE_BUILD_TIME': JSON.stringify(new Date().toISOString()),
    },
    // Dependency optimization
    optimizeDeps: {
      include: ['react', 'react-dom', 'matter-js', 'recharts'],
      exclude: ['@vite/client', '@vite/env']
    },
    // Error handling
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    }
  };
});
