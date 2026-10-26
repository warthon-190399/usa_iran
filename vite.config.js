import { defineConfig } from 'vite'

// base relativa: funciona en GitHub Pages (/usa_iran/) y en local sin cambios
export default defineConfig({
  base: './',
  build: { chunkSizeWarningLimit: 600 },
})
