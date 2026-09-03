/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    serverActions: {
      // Padrão do Next.js é só 1 MB — pequeno demais para o upload do PDF
      // do e-book em /admin/site. 20 MB cobre um e-book bem ilustrado com
      // folga.
      bodySizeLimit: "20mb",
    },
  },
};

module.exports = nextConfig;
