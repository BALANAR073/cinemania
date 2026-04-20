import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        'add-entity': resolve(__dirname, 'add-entity.html'),
        'film-details': resolve(__dirname, 'film-details.html')
      }
    }
  },
  server: {
    port: 3000,
    open: true
  }
})