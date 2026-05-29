## Why

A critical React loading runtime error occurs on production build load due to a circular dependency between chunk files (`vendor-core` and `vendor-react`), created by the manual chunk splitting logic in the Vite configuration. This circular import reference results in React being imported as undefined in other packages (e.g., `react-i18next`), causing the app to crash immediately upon loading.

Additionally, a console warning highlights a deprecated mobile meta tag in `index.html`.

## What Changes

- Refactor `vite.config.ts`'s `rollupOptions.output.manualChunks` code-splitting logic to ensure all React core libraries (`react`, `react-dom`, `scheduler`, `react-is`, `react-router`, `react-router-dom`, `@remix-run/router`) are cleanly bundled together in a self-contained `vendor-react` chunk, eliminating any circular dependencies with `vendor-core`.
- Replace the deprecated `<meta name="apple-mobile-web-app-capable" content="yes">` tag in `index.html` with `<meta name="mobile-web-app-capable" content="yes">`.

## Capabilities

### New Capabilities
*(None)*

### Modified Capabilities
- `chunk-optimization`: Ensure code-splitting configuration isolates chunks properly without creating circular dependency cycles or runtime initialization exceptions.


## Impact

- **Vite Configuration**: `vite.config.ts` manual chunks logic.
- **Index Template**: `index.html` meta tags.
- **Bundled Assets**: Re-organized JS chunks without runtime loader exceptions.
