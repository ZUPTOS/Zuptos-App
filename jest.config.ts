import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./"
});

const customJestConfig: Config = {
  testEnvironment: "jest-environment-jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/components/Header.tsx",
    "src/components/DateFilter.tsx",
    "src/components/DashboardLayout.tsx",
    "src/hooks/**/*.{ts,tsx}",
    "src/views/MyAccount.tsx",
    "src/views/NotFound.tsx"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "text-summary"] satisfies Config["coverageReporters"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1"
  } satisfies Config["moduleNameMapper"]
};

export default createJestConfig(customJestConfig);
