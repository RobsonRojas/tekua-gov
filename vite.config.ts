import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@asamuzakjp/css-color': '@asamuzakjp/css-color/dist/index.mjs',
      '@csstools/css-calc': '@csstools/css-calc/dist/index.mjs',
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    css: false,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    server: {
      deps: {
        inline: [/@mui\/material/, /@mui\/system/, /@csstools/, /@asamuzakjp\/css-color/],
      },
    },
  },
})
