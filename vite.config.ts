import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8083',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          // Only bypass exact API detail routes like /api/123 (frontend routes)
          // Allow everything else: /api/123/check, /api/apis/123/check, etc.
          if (req.url?.match(/^\/api\/\d+$/)) {
            console.log(`🚫 Bypassing frontend route: ${req.url}`);
            return req.url;
          }
          console.log(`🔄 Proxying to backend: ${req.url} -> http://localhost:8083${req.url}`);
        }
      }
    }
  }
})
