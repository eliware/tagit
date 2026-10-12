import {
  hasMainPushTrigger,
  jobHasCommand,
  jobHasUse,
  jobValue,
  parseJobs,
  parseWorkflow,
} from "./workflow-format.mjs";
import { validatePublicationWorkflow } from "./validate-publication-workflow.mjs";

const REQUIRED_COMMANDS = ["npm ci", "npm test"];

export function validateReleaseWorkflow(fs, packageData = {}) {
  const failures = [];
  const ciPath = ".github/workflows/ci.yaml";
  if (!fs.existsSync(ciPath)) return failures;
  const sections = parseWorkflow(fs.readFileSync(ciPath, "utf8"));
  const trigger = sections.get("on") ?? sections.get('"on"') ?? [];
  const jobs = parseJobs(sections.get("jobs") ?? []);
  const validate = [...jobs.values()].flat();
  for (const command of REQUIRED_COMMANDS)
    if (!jobHasCommand(validate, command))
      failures.push(`BLOCKED: release workflow must run ${command}.`);
  if (!hasMainPushTrigger(trigger))
    failures.push("BLOCKED: CI workflow must run on pushes to main.");
  if (
    !trigger.some(
      (line) => jobValue([line], "pull_request") !== null || line.trim() === "pull_request:",
    )
  )
    failures.push("BLOCKED: CI workflow must run on pull requests.");
  if (!jobHasUse(validate, "actions/checkout@"))
    failures.push("BLOCKED: CI workflow must check out the repository.");
  if (!jobHasUse(validate, "actions/setup-node@v7"))
    failures.push("BLOCKED: CI workflow must use actions/setup-node@v7.");
  if (!jobHasCommand(validate, "npm -g install npm@latest"))
    failures.push("BLOCKED: CI workflow must install npm@latest before npm ci.");
  const profiles = packageData.eliware?.apply ?? [];
  if (profiles.includes("npm-published") || profiles.includes("ghcr-published"))
    failures.push(...validatePublicationWorkflow(fs));
  return failures;
}
