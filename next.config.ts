import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fija la raíz del workspace a este proyecto (evita que Next infiera la raíz
  // por un package-lock.json del directorio padre).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
