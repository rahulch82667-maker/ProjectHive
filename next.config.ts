import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling server-only native packages
  serverExternalPackages: ['nodemailer', 'mongoose', 'bcrypt'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
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

export default nextConfig;
