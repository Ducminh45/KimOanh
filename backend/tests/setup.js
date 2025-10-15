// Test setup file
require('dotenv').config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Increase timeout for integration tests
jest.setTimeout(30000);

// Global test helpers
global.testHelpers = {
  generateRandomEmail: () => `test${Date.now()}${Math.random().toString(36)}@test.com`,
  
  generateValidUser: () => ({
    email: global.testHelpers.generateRandomEmail(),
    password: 'Test123!',
    fullName: 'Test User',
  }),
  
  sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Mock console methods in test environment
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};
