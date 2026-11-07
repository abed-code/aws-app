import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Self-contained server bundle, so the Docker/ECS deploy in step 5 stays small.
  output: "standalone",
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
