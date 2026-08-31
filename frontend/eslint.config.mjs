import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const configs = [...nextVitals, ...nextTs];

for (const cfg of configs) {
  if (cfg.rules) {
    for (const ruleKey of Object.keys(cfg.rules)) {
      if (
        ruleKey.includes("no-explicit-any") ||
        ruleKey.includes("no-unused-vars") ||
        ruleKey.includes("purity") ||
        ruleKey.includes("set-state-in-effect") ||
        ruleKey.includes("no-img-element")
      ) {
        cfg.rules[ruleKey] = "off";
      }
    }
  }
}

const eslintConfig = defineConfig([
  ...configs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);

export default eslintConfig;
