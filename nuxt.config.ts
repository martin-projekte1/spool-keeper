// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',

  // Nuxt 4 Features - Fixes TS2353 for inlineStyles
  features: {
    inlineStyles: true,
  },

  modules: [
    '@nuxt/ui',
    '@nuxt/image',
    '@nuxt/fonts',
    '@vite-pwa/nuxt',
    'nuxt-auth-utils',
    'nuxt-qrcode',
  ],

  qrcode: {
    reader: {
      formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'data_matrix'],
    },
  },

  icon: {
    clientBundle: {
      scan: true,
    },
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'dark',
  },

  // Optimized Font configuration for Nuxt 4
  fonts: {
    defaults: {
      weights: [400, 700],
      styles: ['normal'],
      subsets: ['latin'],
    },
    // Nuxt 4 handles font-display: swap automatically or via CSS
  },

  pwa: {
    manifest: {
      name: 'Spool Keeper',
      short_name: 'SpoolKeeper',
      description: 'Filament spool management for 3D printing.',
      theme_color: '#111111',
      background_color: '#111111',
      display: 'standalone',
      start_url: '/',
      scope: '/',
      icons: [
        {src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png'},
        {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png'},
        {src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable'},
      ],
    },
    workbox: {
      navigateFallback: null,
      globPatterns: ['**/*.{js,css,html,svg,ico}'],
      runtimeCaching: [
        {
          urlPattern: /\.(?:png|jpg|jpeg|svg)$/,
          handler: 'CacheFirst',
          options: {
            cacheName: 'filament-images',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 30 * 24 * 60 * 60,
            },
          },
        },
      ],
    },
  },

  app: {
    head: {
      htmlAttrs: {lang: 'en'},
      title: 'Spool Keeper',
      meta: [
        {name: 'color-scheme', content: 'dark'},
        {name: 'description', content: 'Filament spool management for 3D printing.'},
      ],
      link: [
        {rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg'},
        {rel: 'apple-touch-icon', href: '/apple-touch-icon.png'},
      ],
      script: [
        {
          'data-goatcounter': 'https://spoolkeeper.goatcounter.com/count',
          src: 'https://gc.zgo.at/count.js',
          async: true,
          tagPosition: 'bodyClose'
        }
      ],
    },
  },

  // Cache optimized images from IPX for 1 year
  routeRules: {
    '/_ipx/**': {headers: {'cache-control': 'max-age=31536000, immutable'}},
  },

  nitro: {
    compressPublicAssets: true,
    experimental: {
      websocket: true,
    },
  },
})