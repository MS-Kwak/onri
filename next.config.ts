import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
      {
        protocol: 'https',
        hostname: 'aqouemvoiiqdcqsodnrc.supabase.co',
      },
    ],
  },
};

export default nextConfig;
