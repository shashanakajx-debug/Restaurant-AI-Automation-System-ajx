import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Temporarily ignore ESLint errors during production build so we can
  // iterate on types/linting separately. Remove or set to false before
  // final production deploy.
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
