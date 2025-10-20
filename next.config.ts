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
