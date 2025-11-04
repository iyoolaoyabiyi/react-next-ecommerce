/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  turbopack: {},
  future: {
    webpack5: true,
  },
  webpack: config => {
    // Switch away from the legacy md4 hashing algorithm removed in OpenSSL 3+ / Node 17+.
    config.output.hashFunction = 'sha256'
    return config
  },
}

module.exports = nextConfig
