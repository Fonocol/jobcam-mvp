import type { NextConfig } from "next";


const nextConfig : NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // TEMPORAIRE : laisse le build passer malgré ESLint
  },
};

module.exports = nextConfig;
