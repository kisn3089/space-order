import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "standalone",
  outputFileTracingRoot: path.join(__dirname, "../../"),
  devIndicators: false,
  experimental: {
    reactCompiler: true,
  },
  transpilePackages: ["@spaceorder/ui"],
  async redirects() {
    return [
      {
        source: "/",
        destination: "/stores",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
