/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow pop‑up windows created by Firebase sign‑in to close without COOP violations
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
};
module.exports = nextConfig;
