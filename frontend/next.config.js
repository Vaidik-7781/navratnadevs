/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: { serverActions: { allowedOrigins: ['*'] } },
  images: { domains: ['d8j0ntlcm91z4.cloudfront.net'] },
}
module.exports = nextConfig
