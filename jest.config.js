/**
 * @description
 * Jest configuration for client-side testing in the WhatsApp Sticker Maker app.
 * Sets up the testing environment and configurations for Next.js.
 *
 * Key features:
 * - Configured for Next.js with React testing
 * - Uses jsdom for browser environment simulation
 * - Includes code coverage reporting
 * - Sets up module name mapping for path aliases
 *
 * @dependencies
 * - jest: Core testing framework
 * - jest-environment-jsdom: Simulates browser environment
 * - @testing-library/react: For testing React components
 * - @testing-library/jest-dom: Provides custom matchers for DOM testing
 */

const nextJest = require("next/jest")

// Providing the path to your Next.js app which will enable loading next.config.js and .env files
const createJestConfig = nextJest({
  dir: "./"
})

// Any custom Jest config you want to set up
/** @type {import('jest').Config} */
const customJestConfig = {
  // Setup environment for testing
  testEnvironment: "jest-environment-jsdom",
  
  // Set the directory where Jest should look for tests
  testMatch: ["**/__tests__/**/*.test.[jt]s?(x)"],
  
  // Automatically clear mock calls, instances, and results before every test
  clearMocks: true,
  
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  
  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",
  
  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/"
  ],
  
  // The root directory that Jest should scan for tests and modules
  rootDir: ".",
  
  // A map from regular expressions to module names that allow to stub out resources
  moduleNameMapper: {
    // Handle module aliases (configured in tsconfig.json)
    "^@/(.*)$": "<rootDir>/$1"
  },
  
  // The list of paths to directories that Jest should use to search for files in
  roots: [
    "<rootDir>"
  ],
  
  // Setup files to run after the environment is set up
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  
  // An array of regexp pattern strings that are matched against all test paths before running tests
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/"
  ]
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config
module.exports = createJestConfig(customJestConfig)