#!/usr/bin/env node
import { execFileSync } from 'node:child_process';
import { pushExistingCommits } from '../src/commands/push/push-existing-commits.mjs';

pushExistingCommits(execFileSync);
