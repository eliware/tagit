#!/usr/bin/env node
import { runTagit } from "../src/cli/application/run-tagit.mjs";

const args = process.argv.slice(2);
await runTagit(
  {},
  args.some((argument) => ["--help", "-h", "--version", "-v"].includes(argument))
    ? args
    : ["push", ...args],
);
