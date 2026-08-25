#!/usr/bin/env node
import { execSync } from 'node:child_process';
import { runUpstream } from './upstream.mjs';

runUpstream(process.argv.slice(2), execSync);
