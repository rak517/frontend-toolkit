import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@frontend-toolkit-js/components',
    '@frontend-toolkit-js/hooks',
    '@frontend-toolkit-js/utils',
  ],
};

export default nextConfig;
