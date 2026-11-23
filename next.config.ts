import type { NextConfig } from "next";

// Export statique partout (Core et DDIL/edge) : aucune dépendance serveur Node en production.
const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  trailingSlash: true,
  reactStrictMode: true,
};

export default nextConfig;
