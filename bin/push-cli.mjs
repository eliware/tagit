#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { runPush } from './push.mjs';

runPush(process.argv.slice(2), execFileSync);
