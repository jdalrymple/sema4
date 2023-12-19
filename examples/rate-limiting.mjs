import { RateLimit } from 'sema4';

async function foo() {
  console.log('Naive requests per second rate limiting');

  const n = 50;
  const rl = new RateLimit(5);
  const start = process.hrtime();

  for (let i = 0; i < n; i++) {
    await rl.apply();

    process.stdout.write('.');
  }

  process.stdout.write('\n');

  const hrt = process.hrtime(start);
  const elapsed = (hrt[0] * 1000 + hrt[1] / 1e6) / 1000;
  const rps = n / elapsed;

  console.log(rps.toFixed(3) + ' req/s');
}

async function bar() {
	console.log('Custom rate limit time unit');

	const n = 20;
	const rl = new RateLimit(5, { interval: 60 * 1000 });
	const start = process.hrtime();

	for (let i = 0; i < n; i++) {
		await rl.limit();
		process.stdout.write('.');
	}
	process.stdout.write('\n');

	const hrt = process.hrtime(start);
	const elapsed = (hrt[0] * 1000 + hrt[1] / 1e6) / 1000;
	const rps = n / (elapsed / 60);
	console.log(rps.toFixed(3) + ' req/min');
}

async function baz() {
  console.log('Cleaning up rl after usage');

  const n = 4;
  const rl = new RateLimit(5, { interval: 60 * 1000 });
  const start = process.hrtime();
  const to = []

  for (let i = 0; i < n; i++) {
    process.stdout.write('s');

    await rl.limit();

    process.stdout.write('. ');
  }

  rl.reset()

  const hrt = process.hrtime(start);
  const elapsed = (hrt[0] * 1000 + hrt[1] / 1e6) / 1000;
  const rps = n / (elapsed / 60);

  console.log(rps.toFixed(3) + ' req/min');
}


async function qux() {
  console.log('Uniform distribution of requests over time');

  const n = 50;
  const rl = new RateLimit(5, { uniformDistribution: true });
  const start = process.hrtime();

  for (let i = 0; i < n; i++) {
    await rl.limit();

    process.stdout.write('.');
  }

  process.stdout.write('\n');

  const hrt = process.hrtime(start);
  const elapsed = (hrt[0] * 1000 + hrt[1] / 1e6) / 1000;
  const rps = n / elapsed;

  console.log(rps.toFixed(3) + ' req/s');
}

bar()
  .then(bar)
  .then(qux)
  .then(baz)
  .catch((e) => console.log(e))
  .then(() => console.log('READY'));
