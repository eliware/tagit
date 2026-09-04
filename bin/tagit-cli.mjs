#!/usr/bin/env node
import { runTagit } from '../src/cli/application/run-tagit.mjs';

await runTagit({}, process.argv.slice(2));
