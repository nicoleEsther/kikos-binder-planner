import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      '/tcg': {
        target: 'https://api.pokemontcg.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tcg/, '')
      },
      '/tcgdex': {
        target: 'https://api.tcgdex.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/tcgdex/, '')
      }
    }
  }
})