/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configurazione dinamica per piattaforma Web3
  experimental: {
    serverComponentsExternalPackages: ['@solana/web3.js']
  },
  webpack: (config) => {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    }
    return config
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
}

module.exports = nextConfig

