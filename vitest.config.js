import { defineConfig } from 'vitest/config';

// Two projects because the halves need different environments. The server code
// is plain node, the client needs a DOM. One command runs both.
export default defineConfig({
  test: {
    projects: [
      {
        test: {
          name: 'server',
          environment: 'node',
          include: ['server/**/*.test.js'],
        },
      },
      {
        // No react plugin. It lives in the client workspace, and vitest 4
        // transforms jsx on its own, so tests only need the environment
        test: {
          name: 'client',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.js'],
          include: ['client/src/**/*.test.{js,jsx}'],
        },
      },
    ],
  },
});
