module.exports = {
  preset: 'ts-jest/presets/js-with-ts',
  globals: {
    TEST_RESOURCES_PATH: 'test/.resources/data',
    TEST_TMP_PATH: 'test/.resources/tmp',
    QUIET_EXIT_MESSAGE: 'EEXIT: 1'
  },
  setupFilesAfterEnv: ['./test/.resources/mocks/index.ts'],
  testPathIgnorePatterns: ['<rootDir>/smoke-test/'],
  verbose: true,
  collectCoverageFrom: ['src/**/*.ts', '!src/schemas/*.ts', '!src/**/index.ts'],
  coverageReporters: ['text', 'html']
};
