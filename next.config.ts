import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Add this 'images' configuration block
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
      },
      // You can also add the placeholder hostname here if you need it for testing
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/tstatic/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
      {
        source: '/css2',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
          { key: 'Cache-Control', value: 'public, max-age=86400, s-maxage=31536000, stale-while-revalidate=604800' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/project', // The incoming path
        destination: '/projects', // The destination path
        permanent: true, // Use a 308 Permanent Redirect
      },
    ]
  }
};

export default nextConfig;
