import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Yuqori papkalarda boshqa package-lock.json bo'lgani uchun loyiha ildizini aniq ko'rsatamiz
  outputFileTracingRoot: path.join(__dirname),
  poweredByHeader: false,
};

export default nextConfig;
