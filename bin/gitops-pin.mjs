#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { updateGitOpsPins } from '../src/gitopsPins.mjs';

function value(args, name) {
  const index = args.indexOf(name);
  if (index === -1) return null;
  const result = args[index + 1];
  if (!result || result.startsWith('--')) throw new Error(`${name} requires a value.`);
  return result;
}

const args = process.argv.slice(2);
try {
  const allowed = new Set(['--gitops-root', '--registry', '--source', '--version', '--digest', '--dry-run']);
  for (const arg of args.filter(item => item.startsWith('--'))) {
    if (!allowed.has(arg)) throw new Error(`Unknown option: ${arg}`);
  }
  for (const option of ['--gitops-root', '--registry', '--source', '--version', '--digest']) {
    if (args.filter(item => item === option).length > 1) throw new Error(`Duplicate option: ${option}`);
  }
  const result = updateGitOpsPins(fs, execFileSync, console, {
    gitopsRoot: value(args, '--gitops-root'),
    registryPath: value(args, '--registry') ?? 'apps/image-pins.json',
    sourceRepository: value(args, '--source'),
    version: value(args, '--version'),
    digest: value(args, '--digest'),
    dryRun: args.includes('--dry-run'),
  });
  console.log(JSON.stringify({ ok: true, ...result }));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
