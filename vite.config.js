import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate', // 新バージョンを自動で適用
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Digi-Placard',
        short_name: 'Digi-Placard',
        description: 'デジタルプラカード',
        theme_color: '#3b82f6', // blue-500 に合わせた
        background_color: '#ffffff',
        display: 'fullscreen', // スマホで全画面表示（プラカード用途に最適）
        orientation: 'any',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable', // Android のアダプティブアイコン対応
          },
        ],
      },
      workbox: {
        skipWaiting: true, // 新しいSWを即座にアクティブ化
        clientClaim: true, // 即座に全クライアントを制御化に置く
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // ↑ これらのファイルを全部キャッシュしてオフライン対応
      },
    }),
  ],
});
