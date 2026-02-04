import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    // We no longer inject API_KEY here for security. 
    // It is handled by the Netlify Function.
    'process.env': {}, 
  },
  build: {
    outDir: 'dist',
  }
});