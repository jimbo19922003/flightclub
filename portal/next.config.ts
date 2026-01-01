import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
        allowedOrigins: [
            "localhost:3000",
            "verbose-broccoli-9w5g5x74x6rfj6j-3000.app.github.dev"
        ]
    }
  }
};

export default nextConfig;
