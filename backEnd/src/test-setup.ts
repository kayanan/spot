// Test setup file for Jest
import 'jest';

// Global test setup
beforeAll(() => {
  // Setup any global test configuration here
  console.log('Setting up test environment...');
});

afterAll(() => {
  // Cleanup any global test configuration here
  console.log('Cleaning up test environment...');
});

// Global test utilities
global.console = {
  ...console,
  // Uncomment to suppress console.log during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
}; 