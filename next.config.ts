import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media-cdn.vwe.nl" },
      { protocol: "https", hostname: "ksrautos.nl" },
      { protocol: "https", hostname: "placehold.co" },
      // Supabase Storage public bucket — keep wildcard for any project ref
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
      { protocol: "https", hostname: "*.supabase.in", pathname: "/storage/v1/object/public/**" },
    ],
    qualities: [60, 75, 85, 90],
    minimumCacheTTL: 60 * 60 * 4, // 4h
  },
  async redirects() {
    return [
      { source: "/occasions", destination: "/aanbod", permanent: true },
      { source: "/occasions/:slug", destination: "/aanbod/:slug", permanent: true },
      { source: "/reviews", destination: "/", permanent: false },
    ];
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
