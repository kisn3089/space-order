import path from "path";
import { fileURLToPath } from "url";
import type { NextConfig } from "next";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  devIndicators: false,
  experimental: {
    reactCompiler: true,
  },
  transpilePackages: [
    "@spaceorder/ui",
    "@spaceorder/api",
    "@spaceorder/auth",
    "@spaceorder/db",
  ],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30일: 메뉴 이미지는 자주 바뀌지 않으므로 길게 캐싱
  },
};

export default nextConfig;
