import { Sema } from './Sema';

export function createRateLimiter(
  rptu: number,
  {
    timeUnit = 1000,
    uniformDistribution = false,
  }: {
    timeUnit?: number;
    uniformDistribution?: boolean;
  } = {},
): () => Promise<void> {
  if (!Number.isInteger(rptu) || rptu < 0) {
    throw new TypeError(
      'The rate-limit-per-time-unit (rptu) should be an integer and greater than zero',
    );
  }

  const sema = new Sema(uniformDistribution ? 1 : rptu);
  const delay = uniformDistribution ? timeUnit / rptu : timeUnit;

  return async function limiter() {
    await sema.acquire();
    setTimeout(() => sema.release(), delay);
  };
}
