## 1. Bundling and Code-Splitting Optimization

- [x] 1.1 Refactor Vite configuration `rollupOptions.output.manualChunks` in `vite.config.ts` to group `react`, `react-dom`, `scheduler`, `react-is`, `react-router`, `react-router-dom`, and `@remix-run/router` into a self-contained `vendor-react` chunk.
- [x] 1.2 Replace deprecated apple-mobile-web-app-capable meta tag in `index.html` with mobile-web-app-capable.

## 2. Validation and Verification

- [x] 2.1 Run production build using `npm run build` and verify that no circular chunk warnings are emitted by Rollup.
- [x] 2.2 Verify that the built application files compile successfully and can boot up cleanly in the browser.
