import { parseJobs, parseWorkflow } from "./workflow-format.mjs";
import { jobHasCommand, jobHasUse } from "./workflow-job-rules.mjs";
import { validateCiTriggers } from "./validate-ci-triggers.mjs";

const REQUIRED_COMMANDS = ["npm ci", "npm test"];

export function validateCiWorkflow(fs) {
  const ciPath = ".github/workflows/ci.yaml";
  if (!fs.existsSync(ciPath)) return null;
  const sections = parseWorkflow(fs.readFileSync(ciPath, "utf8"));
  const trigger = sections.get("on") ?? sections.get('"on"') ?? [];
  const jobs = parseJobs(sections.get("jobs") ?? []);
  const validate = [...jobs.values()].flat();
  const failures = [];
  for (const command of REQUIRED_COMMANDS)
    if (!jobHasCommand(validate, command))
      failures.push(`BLOCKED: release workflow must run ${command}.`);
  failures.push(...validateCiTriggers(trigger));
  if (!jobHasUse(validate, "actions/checkout@"))
    failures.push("BLOCKED: CI workflow must check out the repository.");
  if (!jobHasUse(validate, "actions/setup-node@v7"))
    failures.push("BLOCKED: CI workflow must use actions/setup-node@v7.");
  if (!jobHasCommand(validate, "npm -g install npm@latest"))
    failures.push("BLOCKED: CI workflow must install npm@latest before npm ci.");
  return failures;
}
