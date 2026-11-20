import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "frame-ancestors 'self' https://*.pinet.com https://*.minepi.com",
              "connect-src 'self' https://socialchain.app https://api.minepi.com https://sdk.minepi.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
