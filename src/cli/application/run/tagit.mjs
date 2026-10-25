#!/usr/bin/env node
import { assembleDependencies } from "../assemble-dependencies.mjs";
import { runCliBoundary } from "./cli-boundary.mjs";
import { buildDispatchContext } from "../build-dispatch-context.mjs";

export async function runTagit(overrides = {}, argv = []) {
  const dependencies = assembleDependencies(overrides);
  dependencies.output = overrides.output ?? console.log;
  await runCliBoundary(buildDispatchContext(dependencies), argv);
}
