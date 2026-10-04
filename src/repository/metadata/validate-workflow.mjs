import {
  hasMainPushTrigger,
  hasTagTrigger,
  jobHasCommand,
  jobHasUse,
  jobValue,
  parseJobs,
  parseWorkflow,
} from "./workflow-format.mjs";

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
    validatePublicationWorkflow(fs, failures);
  return failures;
}

function validatePublicationWorkflow(fs, failures) {
  const publishPath = ".github/workflows/publish.yaml";
  if (!fs.existsSync(publishPath)) return;
  const sections = parseWorkflow(fs.readFileSync(publishPath, "utf8"));
  const jobs = parseJobs(sections.get("jobs") ?? []);
  const publish = jobs.get("publish") ?? [];
  if (!hasTagTrigger(sections.get("on") ?? sections.get('"on"') ?? []))
    failures.push("BLOCKED: publication workflow must trigger for numeric version tags.");
  if (!jobs.has("publish"))
    failures.push("BLOCKED: publication workflow must contain a publish job.");
  if (!jobValue(publish, "needs"))
    failures.push("BLOCKED: publication job must depend on validation.");
  if (!jobHasUse(publish, "actions/checkout@"))
    failures.push("BLOCKED: publication job must check out the release commit.");
  if (!jobHasUse(publish, "actions/setup-node@v7"))
    failures.push("BLOCKED: publication job must use actions/setup-node@v7.");
  if (!jobHasCommand(publish, "npm -g install npm@latest"))
    failures.push("BLOCKED: publication job must install npm@latest before npm ci.");
  if (!jobHasCommand(publish, "npm ci")) failures.push("BLOCKED: publication job must run npm ci.");
  if (!jobHasCommand(publish, "npm publish --provenance"))
    failures.push("BLOCKED: publication job must publish with npm provenance.");
  if (publish.some((line) => /NPM_TOKEN|NODE_AUTH_TOKEN/.test(line)))
    failures.push(
      "BLOCKED: publication workflow must use Trusted Publishing without static npm tokens.",
    );
  if (!publish.some((line) => line.trim() === "id-token: write"))
    failures.push("BLOCKED: publication job must grant id-token: write.");
}
