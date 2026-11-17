import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

const MOCK_TARGET = process.env.MOCK_TARGET || 'http://127.0.0.1:8787';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [vue()],
    resolve: {
      alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
    },
    server: {
      host: true,
      port: Number(env.VITE_DEV_PORT || 5173),
      // 开发期把 /api 代理到本地 Mock（mock/server.js），浏览器侧保持同源、无需 CORS
      proxy: env.VITE_USE_PROXY === '0' ? undefined : { '/api': { target: MOCK_TARGET, changeOrigin: true } },
    },
  };
});
