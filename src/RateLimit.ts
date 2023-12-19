import { Sema } from './Sema';

export class RateLimit {
  private sema: Sema;

  private delay: number;

  private timeouts: NodeJS.Timeout[] = [];

  constructor(
    rate: number,
    {
      interval = 1000,
      uniformDistribution = false,
    }: {
      interval?: number;
      uniformDistribution?: boolean;
    } = {},
  ) {
    if (!Number.isInteger(rate) || rate < 0) {
      throw new TypeError(
        'The rate-limit-per-time-unit (rptu) should be an integer and greater than zero',
      );
    }

    this.sema = new Sema(uniformDistribution ? 1 : rate);
    this.delay = uniformDistribution ? interval / rate : interval;
  }

  async apply(): Promise<NodeJS.Timeout> {
    await this.sema.acquire();

    const tm = setTimeout(() => this.sema.release(), this.delay);

    this.timeouts.push(tm);

    return tm;
  }

  reset(): number {
    const timeoutsToClear = this.timeouts.length;

    this.timeouts.forEach((t) => {
      clearTimeout(t);
      this.sema.release();
    });

    this.timeouts = [];

    return timeoutsToClear;
  }
}
