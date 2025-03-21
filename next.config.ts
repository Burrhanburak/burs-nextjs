import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "placehold.co",
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  }, async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'x-middleware-request-host',
            value: 'burs-nextjs.vercel.app',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    // Fix for building standalone output
    if (isServer) {
      config.externals = [...(config.externals || [])];
    }
    return config;
  },
};

export default nextConfig;
