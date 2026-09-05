import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';

const prefix = dirname(process.execPath);
const candidates = [
  join(prefix, 'node_modules', '@eliware', 'test', 'bin', 'eliware-test.mjs'),
  join(prefix, 'lib', 'node_modules', '@eliware', 'test', 'bin', 'eliware-test.mjs'),
  ...(process.env.npm_config_prefix ? [join(process.env.npm_config_prefix, 'node_modules', '@eliware', 'test', 'bin', 'eliware-test.mjs')] : []),
];
const executable = candidates.find(candidate => existsSync(candidate));
if (!executable) throw new Error(`Global eliware-test was not found. Checked: ${candidates.join(', ')}`);
const child = spawn(process.execPath, [executable, ...process.argv.slice(2)], { stdio: 'inherit', shell: false });
child.on('error', error => {
  process.stderr.write(`Unable to launch global eliware-test: ${error.message}\n`);
  process.exit(1);
});
child.on('exit', code => process.exit(code ?? 1));
