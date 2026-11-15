// AI-assisted: written with Claude Code, reviewed by the team.
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base './' plus HashRouter lets the same build run from any GitHub Pages subpath.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  // When the checkout lives in iCloud Drive, node_modules is a link to node_modules.nosync.
  // Keeping the link in paths lets the dev server still treat those files as dependencies.
  resolve: { preserveSymlinks: true },
  test: { environment: 'node', include: ['src/**/*.test.ts'] },
});
