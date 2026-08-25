#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { runPush } from './push.mjs';

runPush(process.argv.slice(2), execSync);
