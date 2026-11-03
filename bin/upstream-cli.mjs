#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { runUpstream } from "../src/upstream/run-merge.mjs";
import { readFileSync } from "node:fs";
import { runUpstreamCli } from "../src/upstream/cli/run.mjs";

runUpstreamCli(process.argv.slice(2), {
  execFileSync,
  readFileSync,
  now: new Date(),
  log: console,
  runUpstream,
});
