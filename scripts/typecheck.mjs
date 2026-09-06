import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

for (const directory of ['bin', 'src']) {
  for (const file of readdirSync(directory).filter((name) => name.endsWith('.mjs'))) {
    execFileSync(process.execPath, ['--check', join(directory, file)], { stdio: 'inherit' });
  }
}
