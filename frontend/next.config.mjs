import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: false, // Временно отключаем для устранения проблем с hydration
  swcMinify: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, dev, webpack }) => {
    // Улучшаем обработку ошибок загрузки модулей
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Исправляем проблемы с HMR и загрузкой модулей при навигации
    if (dev) {
      // Улучшаем обработку ошибок при загрузке модулей
      config.ignoreWarnings = [
        { module: /node_modules/ },
        { file: /node_modules/ },
      ];
      
      // Улучшаем обработку динамических импортов при навигации
      config.output = {
        ...config.output,
        chunkLoadTimeout: 60000,
        crossOriginLoading: 'anonymous',
      };
      
      // Отключаем агрессивные оптимизации, которые могут вызывать проблемы
      if (!config.optimization) {
        config.optimization = {};
      }
      config.optimization.removeAvailableModules = false;
      config.optimization.removeEmptyChunks = false;
      
      // Улучшаем обработку ошибок при загрузке модулей
      config.module = {
        ...config.module,
        strictExportPresence: false,
      };
      
      // Добавляем плагин для обработки ошибок загрузки модулей
      config.plugins.push(
        new webpack.DefinePlugin({
          __DEV__: JSON.stringify(dev),
        })
      );
    }
    
    return config;
  },
  // Временно отключаем экспериментальные функции, которые могут вызывать проблемы
  // experimental: {
  //   optimizePackageImports: ['next-intl'],
  // },
  // compiler: {
  //   removeConsole: process.env.NODE_ENV === 'production',
  // },
  // Кэширование заголовков
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default withNextIntl(nextConfig);

