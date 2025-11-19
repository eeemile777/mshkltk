import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // SECURITY FIX #5: Removed GEMINI_API_KEY from frontend
    // All AI calls should go through backend proxy (/api/ai/*)
    return {
      define: {
        // Define process.env.NODE_ENV for compatibility
        'process.env.NODE_ENV': JSON.stringify(mode),
        // Block other process.env access - use backend APIs instead
        'process.env.API_KEY': 'undefined',
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        hmr: {
          protocol: 'ws',
          host: 'localhost',
          port: 3000,
          clientPort: 3000
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        },
        dedupe: ['react', 'react-dom', 'react-router-dom']
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          'leaflet',
          'leaflet.markercluster',
          '@google/genai',
          'canvas-confetti',
          'chart.js',
          'react-chartjs-2',
          'recharts',
          'react-icons'
        ],
        force: true
      }
    };
});
