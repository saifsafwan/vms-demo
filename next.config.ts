import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Use Netlify's built-in Next.js SSR support
  // No need for static export - Netlify handles SSR automatically

  // Disable image optimization (optional, can be enabled with Netlify Image CDN)
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
