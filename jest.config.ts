import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./apps/web"
});

const customJestConfig: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "apps/web/src/components/Header.tsx",
    "apps/web/src/components/DateFilter.tsx",
    "apps/web/src/components/DashboardLayout.tsx",
    "apps/web/src/hooks/**/*.{ts,tsx}",
    "apps/web/src/views/MyAccount.tsx",
    "apps/web/src/views/NotFound.tsx"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "text-summary"] satisfies Config["coverageReporters"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/apps/web/src/$1",
    "^@shared/(.*)$": "<rootDir>/packages/shared/src/$1"
  } satisfies Config["moduleNameMapper"]
};

export default createJestConfig(customJestConfig);
