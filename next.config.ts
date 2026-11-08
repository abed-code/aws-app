import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle, so the Docker/ECS deploy in step 5 stays small.
  output: "standalone",
  // Valkey GLIDE ships a native binary; load it with plain Node require.
  serverExternalPackages: ["@valkey/valkey-glide"],
  // The DB client reads the RDS CA bundle at runtime; make sure it ships.
  outputFileTracingIncludes: {
    "/**": ["./certs/**"],
  },
  cacheComponents: true,
  partialPrefetching: true,
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
