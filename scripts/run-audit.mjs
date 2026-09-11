import { spawnSync } from 'node:child_process';

const npm = process.platform === 'win32' ? 'powershell.exe' : 'npm';
const npmArgs =
  process.platform === 'win32'
    ? [
        '-NoProfile',
        '-Command',
        `npm audit --prefix '${process.cwd()}' --omit=dev --audit-level=moderate --ignore-scripts --allow-scripts=''`,
      ]
    : ['audit', '--prefix', process.cwd(), '--omit=dev', '--audit-level=moderate', '--ignore-scripts'];
const { npm_lifecycle_event: _event, npm_lifecycle_script: _script, ...parentEnv } = process.env;
const result = spawnSync(npm, npmArgs, {
  stdio: 'inherit',
  cwd: process.env.TEMP ?? process.env.TMP,
  env: { ...parentEnv, NPM_CONFIG_IGNORE_SCRIPTS: 'true', npm_config_ignore_scripts: 'true' },
});

process.exit(result.status ?? 1);
