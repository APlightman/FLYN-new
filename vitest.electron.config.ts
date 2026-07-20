import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/electron/*_check.{js,ts}'],
    setupFiles: ['./tests/electron/setup.js'],
  },
});
