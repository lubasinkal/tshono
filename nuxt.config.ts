// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  app: {
    head: {
      title: 'Tshono. Fast Botswana jobs search',
      meta: [
        { name: 'description', content: 'Every opportunity in Botswana in one fast search. Filter by sector, place and experience.' },
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
    // Static friendly output for Cloudflare Pages. Typesense stays on the VPS.
    preset: 'cloudflare_pages',
  },
  routeRules: {
    '/': { prerender: true },
    '/insights': { prerender: true },
  },
  typescript: {
    typeCheck: true,
  },
})
