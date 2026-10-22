#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { runUpstream } from "../src/upstream/run-merge.mjs";
import { showUpstreamHelp } from "../src/upstream/cli/help.mjs";
import { showUpstreamVersion } from "../src/upstream/cli/version.mjs";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  showUpstreamHelp(console);
} else if (args.includes("--version") || args.includes("-v")) {
  showUpstreamVersion(readFileSync, new URL("../package.json", import.meta.url), console);
} else {
  runUpstream(args, execFileSync, new Date(), console);
}
