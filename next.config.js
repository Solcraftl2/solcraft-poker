/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // For development - set to false for production
  },
  eslint: {
    ignoreDuringBuilds: true, // For development - set to false for production
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
  // Netlify compatibility settings
  experimental: {
    serverComponentsExternalPackages: ['sharp'],
  },
  // Ensure proper handling of dynamic routes
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/.netlify/functions/:path*',
      },
    ];
  },
};

module.exports = nextConfig;
