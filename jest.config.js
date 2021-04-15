module.exports = {
  testEnvironment: 'node',
  modulePathIgnorePatterns: ['node_modules'],
  testMatch: ['<rootDir>/__tests__/**/*.js'],
  rootDir: './',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        suiteName: 'Lambda Micro Tests',
        outputDirectory: './test-reports/unit-tests/',
      },
    ],
    [
      './node_modules/jest-html-reporter',
      {
        pageTitle: 'Lambda Micro Test Report',
        outputPath: './test-reports/unit-tests/index.html',
      },
    ],
  ],
  collectCoverage: true,
  coverageProvider: 'babel',
  coverageDirectory: './test-reports/coverage/',
  coverageReporters: ['json', 'lcov', 'text', 'clover'],
  collectCoverageFrom: ['<rootDir>/lib/**/*.js', '!**/node_modules/**'],
  coverageThreshold: {
    './lib/': {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  moduleFileExtensions: ['js'],
};
