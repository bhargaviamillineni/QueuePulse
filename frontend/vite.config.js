import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    base: '/',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false
    },
    server: {
      host: env.VITE_HOST,
      port: Number(env.VITE_PORT)
    },
    preview: {
      host: env.VITE_HOST,
      port: Number(env.VITE_PREVIEW_PORT || env.VITE_PORT)
    }
  };
});
