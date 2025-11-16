import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    // SECURITY FIX #5: Removed GEMINI_API_KEY from frontend
    // All AI calls should go through backend proxy (/api/ai/*)
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, './src'),
        }
      },
      optimizeDeps: {
        include: [
          'react',
          'react-dom',
          'react-router-dom',
          'leaflet',
          'leaflet.markercluster', 
          'leaflet.heat',
          '@google/genai',
          'canvas-confetti',
          'chart.js',
          'react-chartjs-2',
          'recharts',
          'react-icons'
        ]
      }
    };
});
