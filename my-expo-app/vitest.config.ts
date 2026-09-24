import { defineConfig } from 'vitest/config';

export default defineConfig({
  define: {
    __DEV__: 'true',
  },
  test: {
    include: ['lib/**/*.test.ts'],
    environment: 'node',
  },
});
