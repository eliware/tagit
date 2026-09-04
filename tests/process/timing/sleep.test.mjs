import { sleep } from '../../../src/process/timing/sleep.mjs';

test('resolves after the requested delay', async () => {
  await expect(sleep(0)).resolves.toBeUndefined();
});
