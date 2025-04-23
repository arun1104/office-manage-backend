module.exports = {
    testTimeout: 10000,
    collectCoverage: true,
    preset: "ts-jest",
    testEnvironment: 'node',
    roots: ['<rootDir>/tests/integrationTests'],
    testMatch: ['**/*.spec.ts'],
    transform: {
      '^.+\\.ts$': 'ts-jest'
    },
    moduleNameMapper: {
        '^@constants': '<rootDir>/src/shared/constants/index.ts',
        '^@interfaces': '<rootDir>/src/shared/interfaces/index.ts',
        '^@enums': '<rootDir>/src/shared/enums/index.ts',
        '^@utilities': '<rootDir>/src/shared/utilities/index.ts',
  },
    setupFiles: ['dotenv/config'],
    moduleDirectories: ['node_modules', 'src'],
    reporters: [
        "default",
        [
            "./node_modules/jest-html-reporter",
            {
                "pageTitle": "Test Report"
            }
        ]
    ]
  };
  