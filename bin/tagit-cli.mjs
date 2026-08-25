#!/usr/bin/env node
import { runTagit } from './tagit.mjs';

await runTagit({}, process.argv.slice(2));
