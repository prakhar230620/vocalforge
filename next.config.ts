import type {NextConfig} from 'next';
import withPWA from 'next-pwa';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Turbopack configuration
  turbopack: {
    // Add Turbopack configuration to match webpack behavior
    resolveExtensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
  },
  // Handle .well-known directory for PWA
  async headers() {
    return [
      {
        source: '/.well-known/assetlinks.json',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
      {
        source: '/.well-known/apple-app-site-association',
        headers: [
          { key: 'Content-Type', value: 'application/json' },
        ],
      },
    ];
  },
};

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // Use default runtimeCaching instead of custom config
  buildExcludes: [/middleware-manifest.json$/],
  maximumFileSizeToCacheInBytes: 3000000,
  fallbacks: {
    document: '/offline',
    image: '',
    audio: '',
    video: '',
    font: ''
  },
});

export default pwaConfig(nextConfig as any);
