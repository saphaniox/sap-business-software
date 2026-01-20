import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 5100,
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      },
      rollupOptions: {
        output: {
          // Add timestamp to filenames for cache busting
          entryFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          chunkFileNames: `assets/[name]-[hash]-${Date.now()}.js`,
          assetFileNames: `assets/[name]-[hash]-${Date.now()}[extname]`,
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'antd-vendor': ['antd', '@ant-design/icons'],
            'chart-vendor': ['chart.js', 'react-chartjs-2', 'recharts']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true
    },
    optimizeDeps: {
      include: ['@ant-design/icons', 'antd'],
      esbuildOptions: {
        target: 'es2015' // Better browser compatibility including Safari
      }
    },
    esbuild: {
      target: 'es2015', // Support Safari and older browsers
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    // Ensure compatibility with Safari and other browsers
    define: {
      'process.env': {}
    }
  }
})
