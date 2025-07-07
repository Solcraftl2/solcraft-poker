/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  typescript: {
    ignoreBuildErrors: true, // For development - set to false for production
  },
  eslint: {
    ignoreDuringBuilds: true, // For development - set to false for production
  }
}

module.exports = nextConfig

