import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // os pacotes do monorepo são TypeScript puro; o Next compila eles junto com o app
  transpilePackages: ["@fenicia/core", "@fenicia/db"],
  // Postgres embutido (só usado no PC); fica fora do bundle
  serverExternalPackages: ["@electric-sql/pglite"],
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
