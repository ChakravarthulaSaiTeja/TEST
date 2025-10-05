import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for Netlify
  output: 'export',
  
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  
  // Configure trailing slash for Netlify
  trailingSlash: true,
  
  // Disable server-side features for static export
  experimental: {
    esmExternals: false,
  },
  
  // Configure asset prefix if needed for CDN
  // assetPrefix: process.env.NODE_ENV === 'production' ? 'https://your-cdn-url.com' : '',
};

export default nextConfig;
