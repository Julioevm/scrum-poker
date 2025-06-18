import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import path from 'path';

export default defineConfig({
  plugins: [preact()],
  root: '.',
  publicDir: 'src/assets',
  build: {
    outDir: 'build',
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      src: '/src',
      Utils: path.resolve(__dirname, 'src/Utils'),
      components: path.resolve(__dirname, 'src/components'),
    },
  },
});