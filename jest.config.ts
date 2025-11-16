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
    "apps/web/src/**/*.{ts,tsx}",
    "!apps/web/src/**/?(*.)+(spec|test).{ts,tsx}",
    "!apps/web/src/**/*.stories.{ts,tsx}",
    "!apps/web/src/**/__tests__/**",
    "!apps/web/src/**/types.ts",
    "!apps/web/src/**/*.d.ts"
  ],
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text", "text-summary"] satisfies Config["coverageReporters"],
  reporters: [
    "default",
    [
      "jest-junit",
      {
        outputDirectory: "coverage",
        outputName: "test-report.xml"
      }
    ]
  ] satisfies Config["reporters"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/apps/web/src/$1",
    "^@shared/(.*)$": "<rootDir>/packages/shared/src/$1"
  } satisfies Config["moduleNameMapper"]
};

export default createJestConfig(customJestConfig);
