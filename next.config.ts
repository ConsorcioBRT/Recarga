import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  eslint: {
    ignoreDuringBuilds: true, // ignora warnings de ESLint no build
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("ssh2", "ssh2-sftp-client");
    }
    return config;
  },
};

export default nextConfig;
