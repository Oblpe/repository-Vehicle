module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(png|svg)$': '<rootDir>/__mocks__/fileMock.js',
    '^leaflet$': '<rootDir>/node_modules/leaflet/dist/leaflet-src.esm.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    '!src/**/*.test.{js,jsx}',
    '!src/index.js'
  ]
};