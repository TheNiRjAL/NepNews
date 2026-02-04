import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    // Polyfill process.env for the browser to prevent crashes when accessing API keys
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env': {}, 
  },
  build: {
    outDir: 'dist',
  }
});