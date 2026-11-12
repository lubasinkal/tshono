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
  routeRules: {
    // Rendered per request so NUXT_PUBLIC_* is read from runtime env, not baked
    // into a prerendered payload at build time. Cached in memory for 10 min.
    '/': { swr: 600 },
    '/insights': { swr: 600 },
  },
  typescript: {
    typeCheck: true,
  },
})
