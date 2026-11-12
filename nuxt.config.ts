// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    viewTransition: true,
    head: {
      title: 'Tshono. Fast Botswana jobs search',
      meta: [
        { name: 'description', content: 'Every opportunity in Botswana in one fast search. Filter by sector, place and experience.' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/tshono.png' },
        { rel: 'apple-touch-icon', href: '/tshono.png' },
        { rel: 'dns-prefetch', href: 'https://ts.lubasiverse.com' },
        { rel: 'preconnect', href: 'https://ts.lubasiverse.com', crossorigin: '' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      // Overridden by NUXT_PUBLIC_* env vars on Cloudflare Pages.
      // Search key must be the scoped search only key, never admin.
      searchHost: '',
      searchPort: '443',
      searchProtocol: 'https',
      searchKey: '',
      searchCollection: 'jobs',
    },
  },
  nitro: {
    // Cloudflare Pages for the static public site; the VPS deploy sets
    // NITRO_PRESET=node-server and runs .output/server/index.mjs.
    preset: process.env.NITRO_PRESET || 'cloudflare_pages',
  },
  routeRules: {
    '/': { prerender: true },
    '/insights': { prerender: true },
  },
  typescript: {
    typeCheck: true,
  },
})
