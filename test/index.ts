import { Sema, createRateLimiter } from '../src/index';

describe('Exports', () => {
  it('should export Sema', () => {
    expect(Sema).toBeDefined();
    expect(Sema).toBeInstanceOf(Object);
  });

  it('should export createRateLimiter helper function', () => {
    expect(createRateLimiter).toBeDefined();
    expect(createRateLimiter).toBeInstanceOf(Function);
  });
});
