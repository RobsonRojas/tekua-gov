import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/admin-integration.test.ts'],
    // We don't need MUI or JSDOM here
  },
})
