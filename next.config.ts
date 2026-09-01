import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,

  // three.js ships untranspiled ESM in a few sub-paths; keeping the
  // transpile list explicit avoids pulling the whole package through Babel.
  transpilePackages: ['three'],

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@react-three/drei', 'date-fns'],
  },

  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
