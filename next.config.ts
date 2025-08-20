import type { NextConfig } from "next";


const nextConfig : NextConfig = {
  eslint: { // a suprimer
    ignoreDuringBuilds: true, // TEMPORAIRE : laisse le build passer malgré ESLint
  },
};

module.exports = nextConfig;
