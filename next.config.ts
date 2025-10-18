import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
