import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Enable dynamic features for fintech theme
  // Removed static export to support middleware and API routes
  
  // Image optimization for better performance
  images: {
    domains: ['localhost'],
    formats: ['image/webp', 'image/avif'],
  },
  
  // Enable ESLint for better code quality
  eslint: {
    ignoreDuringBuilds: false,
  },
  
  // Enable TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Webpack configuration for better module resolution
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'src'),
    };
    return config;
  },
  
  // Experimental features for better performance
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
