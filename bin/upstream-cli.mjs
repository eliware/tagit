#!/usr/bin/env node
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { runUpstream } from "../src/upstream/run-merge.mjs";

const args = process.argv.slice(2);
if (args.includes("--help") || args.includes("-h")) {
  console.log(
    "Usage: upstream [--dry-run] [merge-message...]\nFetch upstream, merge its default branch, and push the result.",
  );
} else if (args.includes("--version") || args.includes("-v")) {
  const packageJson = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
  console.log(packageJson.version);
} else {
  runUpstream(args, execFileSync, new Date(), console);
}
