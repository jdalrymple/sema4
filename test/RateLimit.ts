import { Sema } from '../src/Sema';
import { RateLimit } from '../src/RateLimit';

jest.useFakeTimers();
jest.spyOn(global, 'setTimeout');

const acquireFn = jest.fn();
const releaseFn = jest.fn();

jest.mock('../src/Sema', () => {
  return {
    Sema: jest.fn(() => ({
      acquire: acquireFn,
      release: releaseFn,
    })),
  };
});

describe('RateLimit.constructor', () => {
  it('should create a Sema instance with one maxConcurrency if uniform distribution is true', () => {
    /* eslint-disable no-new */
    new RateLimit(3, { uniformDistribution: true });

    expect(Sema).toHaveBeenCalledWith(1);
  });

  it('should create a Sema instance with passed maxConcurrency if uniform distribution is false', () => {
    /* eslint-disable no-new */
    new RateLimit(3, { uniformDistribution: false });

    expect(Sema).toHaveBeenCalledWith(3);
  });

  it('should create a Sema instance with passed maxConcurrency if a uniform distribution is not passed', () => {
    /* eslint-disable no-new */
    new RateLimit(3);

    expect(Sema).toHaveBeenCalledWith(3);
  });

  it('should throw an error if the rptu is not an integer', () => {
    expect(() => new RateLimit(0.5)).toThrow();
  });

  it('should throw an error if the rptu is negative', () => {
    expect(() => new RateLimit(-5)).toThrow();
  });
});

describe('RateLimit.apply', () => {
  it('should create a timeout using default interval as delay if uniformDistribution is not passed', async () => {
    const rl = new RateLimit(3);

    await rl.apply();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 1000);
  });

  it('should create a timeout using passed interval as delay if uniformDistribution is not passed', async () => {
    const rl = new RateLimit(3, { interval: 2000 });

    await rl.apply();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
  });

  it('should create a timeout using passed interval as delay if uniformDistribution is false', async () => {
    const rl = new RateLimit(3, { uniformDistribution: false, interval: 2000 });

    await rl.apply();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 2000);
  });

  it('should create a timeout using passed interval divided by requests per time unit if uniformDistribution is true', async () => {
    const rl = new RateLimit(2, { uniformDistribution: true, interval: 10000 });

    await rl.apply();

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), 5000);
  });

  it('should call Sema.aquire in limiter function', async () => {
    jest.clearAllMocks();

    const rl = new RateLimit(2);

    await rl.apply();

    expect(acquireFn).toHaveBeenCalledTimes(1);
  });
});

describe('RateLimit.reset', () => {
  it('should clear pending timeouts and release aquired semaphores', async () => {
    const rl = new RateLimit(1, { interval: 10000 });

    await rl.apply();

    const cleared = rl.reset();

    expect(cleared).toBe(1);
  });
});
