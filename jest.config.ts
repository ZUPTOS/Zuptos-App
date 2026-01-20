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
    "src/**/*.{ts,tsx}",
    "!src/**/?(*.)+(spec|test).{ts,tsx}",
    "!src/**/*.stories.{ts,tsx}",
    "!src/**/__tests__/**",
    "!src/**/types.ts",
    "!src/**/*.d.ts",
    "!src/shared/ui/**/*",
    "!src/shared/components/icons/**/*",
    "!src/app/**/*",
    "!src/modules/admin/views/AdminDashboard.tsx",
    "!src/modules/auth/views/*"
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
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@shared/(.*)$": "<rootDir>/src/shared/$1"
  } satisfies Config["moduleNameMapper"]
};

export default createJestConfig(customJestConfig);
