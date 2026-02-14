import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/',
  define: {
    'process.env': {}, // Clear env to prevent accidental leakage
  },
  build: {
    outDir: 'dist',
  }
});