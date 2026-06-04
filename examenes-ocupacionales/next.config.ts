import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exportación estática para GitHub Pages (genera ./out).
  output: "export",
  turbopack: {
    root: __dirname,
  },
  images: {
    // Pages no corre el optimizador de imágenes; servimos las URLs tal cual
    // (las de Unsplash ya se piden con tamaño vía el helper img()).
    unoptimized: true,
  },
};

export default nextConfig;
