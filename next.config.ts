import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "flagcdn.com",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/hr/:path*",
        destination: "/hr-portal/:path*",
        permanent: true,
      },
      {
        source: "/hr",
        destination: "/hr-portal",
        permanent: true,
      },
      {
        source: "/job-search/:path*",
        destination: "/hr-portal/:path*",
        permanent: true,
      },
      {
        source: "/job-search",
        destination: "/hr-portal",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
