import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // El frontend se publica como HTML/CSS/JS estático en GitHub Pages.
  output: "export",
  trailingSlash: true,
  turbopack: {
    root: __dirname,
  },
  images: {
    // Requerido para exportación estática y compatible con GitHub Pages.
    unoptimized: true,
  },
};

export default nextConfig;
