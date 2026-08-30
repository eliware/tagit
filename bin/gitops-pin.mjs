#!/usr/bin/env node
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import { updateGitOpsPins } from '../src/gitopsPins.mjs';

function value(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1];
}

const args = process.argv.slice(2);
try {
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
