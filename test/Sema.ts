import { Sema } from '../src/Sema';

describe('Sema.constructor', () => {
  it('should throw an error if a pauseFn is passed, but a resumeFn isnt', () => {
    expect(() => new Sema(3, { pauseFn: () => 3 })).toThrow();
  });

  test('initFn is called properly', () => {
    const initFn = jest.fn(() => 't');
    const s = new Sema(3, { initFn });

    expect(s).toBeInstanceOf(Sema);
    expect(initFn).toHaveReturnedTimes(3);
  });
});

describe('Sema.acquire', () => {
  it('should aquire a sephamore', async () => {
    const s = new Sema(1);

    const token = await s.acquire();

    expect(token).toBe('1');
    expect(s.waiting()).toEqual(0);
  });

  test('Tokens are returned properly', async () => {
    let maxConcurrency = 0;

    const s = new Sema(3, {
      initFn: () => {
        maxConcurrency += 1;

        return maxConcurrency;
      },
    });

    const tokens = await Promise.all([s.acquire(), s.acquire(), s.acquire()]);

    expect(tokens).toEqual(expect.arrayContaining([1, 2, 3]));
  });
});

describe('Sema.tryAcquire', () => {
  it('should return undefined no sephamores are free', async () => {
    const s = new Sema(1);

    await s.acquire();

    expect(s.tryAcquire()).toBeUndefined();
  });
});

describe('Sema.release', () => {
  it('should add the available free semaphores', () => {
    const s = new Sema(1);

    expect(s.tryAcquire()).toBeDefined();

    s.release();

    expect(s.tryAcquire()).toBeDefined();
    expect(s.tryAcquire()).toBeUndefined();
  });

  it('should use the release token value if an initFn is passed during instance creation', () => {
    const s = new Sema(1, { initFn: () => 1 });

    /* eslint-disable @typescript-eslint/ban-ts-comment, no-underscore-dangle */

    // @ts-expect-error
    const spy = jest.spyOn(s.releaseEmitter, 'emit');

    /* eslint-enable */

    expect(s.tryAcquire()).toBeDefined();

    s.release(1);

    expect(spy).toHaveBeenCalledWith('release', 1);
  });

  it('should use the default token value if an initFn is not passed during instance creation', () => {
    const s = new Sema(1);

    /* eslint-disable @typescript-eslint/ban-ts-comment, no-underscore-dangle */
    // @ts-expect-error
    const spy = jest.spyOn(s.releaseEmitter, 'emit');
    /* eslint-enable */

    expect(s.tryAcquire()).toBeDefined();

    s.release();

    expect(spy).toHaveBeenCalledWith('release', '1');
  });

  it('should execute the pause function once the limit is met', () => {
    const pauseFn = jest.fn();
    const resumeFn = jest.fn();
    const s = new Sema(5, { pauseFn, resumeFn });

    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line
      s.acquire().catch(console.error);
    }

    expect(pauseFn).not.toHaveBeenCalled();
    expect(resumeFn).not.toHaveBeenCalled();

    // eslint-disable-next-line
    s.acquire().catch(console.error);
    expect(pauseFn).toHaveBeenCalled();
    s.release();
    s.release();
    expect(resumeFn).toHaveBeenCalled();
  });
});

describe('Sema.waiting', () => {
  it('should return zero waiting clients', async () => {
    const s = new Sema(1);

    await s.acquire();

    expect(s.waiting()).toEqual(0);
  });

  it('should return the number of waiting clients', async () => {
    const s = new Sema(1);

    await s.acquire();

    // This would block with await
    // eslint-disable-next-line
    s.acquire().catch(console.error);

    expect(s.waiting()).toEqual(1);
  });

  it('should have no waiting clients after releaseing outstanding requests', async () => {
    const s = new Sema(1);

    await s.acquire();

    // This would block with await
    // eslint-disable-next-line
    s.acquire().catch(console.error);

    s.release();

    expect(s.waiting()).toEqual(0);
  });

  it('should still have no waiting clients after releasing outstanding requests more than once', async () => {
    const s = new Sema(1);

    await s.acquire();

    // This would block with await
    // eslint-disable-next-line
    s.acquire().catch(console.error);

    s.release();
    s.release();

    expect(s.waiting()).toEqual(0);
  });

  it('should handle greater maxConcurrency', async () => {
    const s = new Sema(3);

    await s.acquire();
    expect(s.waiting()).toEqual(0);

    await s.acquire();
    expect(s.waiting()).toEqual(0);

    await s.acquire();
    expect(s.waiting()).toEqual(0);
  });
});

describe('Sema.drain', () => {
  it('should acquire the maxConcurrency of sephamores', async () => {
    const s = new Sema(3);

    const spy = jest.spyOn(s, 'acquire');

    const all = await s.drain();

    expect(all.length).toBe(3);
    expect(spy).toHaveBeenCalledTimes(3);
  });
});
