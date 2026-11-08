import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

// Clean architecture dependency rule: inner layers never import outer ones.
//   domain       → nothing but itself
//   application  → domain (+ shared/application ports)
//   infrastructure, presentation → anything inward
const FRAMEWORKS_AND_DRIVERS = {
  regex:
    "^(next|react|react-dom|drizzle-orm|pg|iron-session|openid-client|@aws-sdk|@smithy|@valkey)(/|$)",
  message:
    "Inner layers must not depend on frameworks, databases or AWS. Put this behind a port in infrastructure.",
};
const OUTER_LAYERS = {
  regex: "(^|/)(infrastructure|presentation)(/|$)|\\.module$|^@/features/",
  message: "Inner layers must not import infrastructure, presentation, modules or other features.",
};

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: ["src/features/*/domain/**", "src/shared/domain/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            FRAMEWORKS_AND_DRIVERS,
            OUTER_LAYERS,
            {
              regex: "(^|/)application(/|$)",
              message: "The domain must not depend on the application layer.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/features/*/application/**", "src/shared/application/**"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [FRAMEWORKS_AND_DRIVERS, OUTER_LAYERS] },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
