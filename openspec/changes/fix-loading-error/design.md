## Context

A production build output circular chunk warning was reported by Rollup during Vite bundling:
`Circular chunk: vendor-core -> vendor-react -> vendor-core`

This circular dependency between these two chunks at runtime results in the execution sequence where `vendor-core` executes before the dependencies in `vendor-react` (like `react`) have fully resolved. Thus, packages in `vendor-core` (like `react-i18next`) import React but receive an `undefined` object. Calling `React.createContext` on this undefined object throws:
`Uncaught TypeError: Cannot read properties of undefined (reading 'createContext')`

## Goals / Non-Goals

**Goals:**
- Resolve the circular dependency warning between `vendor-core` and `vendor-react`.
- Eliminate the runtime exception `Cannot read properties of undefined (reading 'createContext')` on production page load.
- Modernize index metadata by resolving the deprecated apple-mobile-web-app-capable console warning.

**Non-Goals:**
- Modify any functional React components or database migrations.
- Change overall styles or core package versions.

## Decisions

### 1. Re-group React and its core/direct dependencies inside `vendor-react`

We will group `react`, `react-dom`, `scheduler`, `react-is`, `@remix-run/router`, `react-router`, and `react-router-dom` under the `vendor-react` chunk.

- **Why**: Putting `react` and `react-dom`'s direct dependencies like `scheduler` and `react-is` (as well as `react-router`'s dependency `@remix-run/router`) in the same chunk prevents `vendor-react` from importing anything from `vendor-core`. The imports then only go one-way (from `vendor-core` components/libs importing react from `vendor-react`), successfully resolving the circular dependency between chunks.
- **Alternatives considered**:
  - *Merging all vendor chunks into a single large chunk*: While simple, it would raise chunk size warnings (~1.7MB total bundle size in one asset) and disable the benefits of caching stable libraries separately.
  - *Moving all libraries importing React into `vendor-react`*: This would bloat `vendor-react` with libraries like `react-i18next`, `react-quill`, `react-markdown`, and Recharts, eventually defeating the purpose of code-splitting.

### 2. Update Mobile Meta Tag in `index.html`

Replace `<meta name="apple-mobile-web-app-capable" content="yes">` with `<meta name="mobile-web-app-capable" content="yes">`.

- **Why**: The console warning reports this deprecation. Replacing it with the modern standard is standard practice.

## Risks / Trade-offs

- **[Risk]** Potential missing React ecosystem dependencies inside `vendor-react` causing a new circular dependency.
  - *Mitigation*: Run a clean `npm run build` and ensure no "Circular chunk" warnings are emitted by Rollup.
