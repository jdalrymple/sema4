import { RateLimit, Sema } from '../src/index';

describe('Exports', () => {
  it('should export Sema', () => {
    expect(Sema).toBeDefined();
    expect(Sema).toBeInstanceOf(Object);
  });

  it('should export RateLimit', () => {
    expect(RateLimit).toBeDefined();
    expect(RateLimit).toBeInstanceOf(Object);
  });
});
