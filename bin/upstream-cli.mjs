#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { runUpstream } from './upstream.mjs';

runUpstream(process.argv.slice(2), execFileSync);
