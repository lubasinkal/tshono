// https://nuxt.com/docs/api/configuration/nuxt-config
import { resolve } from 'node:path'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  // /signup is the same form as /login, started in register mode; two URLs so
  // sign-up is shareable and /login stays the sign-in page.
  hooks: {
    'pages:extend'(pages) {
      pages.push({ name: 'signup', path: '/signup', file: resolve('app/pages/login.vue') })
    },
  },
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
      // Umami analytics. Empty id loads no script at all (local dev default).
      umamiSrc: 'https://analytics.lubasiverse.com/script.js',
      umamiId: 'a7029343-142f-456f-81d3-d7069bf68106',
    },
  },
  typescript: {
    typeCheck: true,
  },
})
