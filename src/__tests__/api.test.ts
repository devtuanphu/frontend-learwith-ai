/**
 * API Layer Tests
 * Tests API endpoint definitions and axios instance configuration
 */
import axios from 'axios';

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
  })),
}));

describe('API Configuration', () => {
  it('should create axios instance with correct baseURL pattern', () => {
    // Re-import to trigger module initialization
    jest.isolateModules(() => {
      require('@/lib/api');
    });
    expect(axios.create).toHaveBeenCalledWith(
      expect.objectContaining({
        baseURL: expect.stringContaining('/api'),
      }),
    );
  });
});

describe('API Endpoint Definitions', () => {
  // Validates that the exported API objects have the expected methods
  it('progressApi should expose game flow methods', async () => {
    const { progressApi } = await import('@/lib/api');
    expect(typeof progressApi.startWarmUp).toBe('function');
    expect(typeof progressApi.submitAnswer).toBe('function');
    expect(typeof progressApi.completeExercise).toBe('function');
    expect(typeof progressApi.getResult).toBe('function');
    expect(typeof progressApi.getOverview).toBe('function');
    expect(typeof progressApi.getErrors).toBe('function');
  });

  it('learningApi should expose practice methods', async () => {
    const { learningApi } = await import('@/lib/api');
    expect(typeof learningApi.startPractice).toBe('function');
    expect(typeof learningApi.startAdvancedPractice).toBe('function');
    expect(typeof learningApi.startApplication).toBe('function');
    expect(typeof learningApi.chat).toBe('function');
    expect(typeof learningApi.getMessages).toBe('function');
    expect(typeof learningApi.completeSession).toBe('function');
  });

  it('categoriesApi should expose menu methods', async () => {
    const { categoriesApi } = await import('@/lib/api');
    expect(typeof categoriesApi.getChildren).toBe('function');
    expect(typeof categoriesApi.getTopics).toBe('function');
  });
});
