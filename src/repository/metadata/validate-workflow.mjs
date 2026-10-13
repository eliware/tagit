import {
  hasTagTrigger,
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
  if (profiles.includes("npm-published")) failures.push(...validatePublicationWorkflow(fs));
  if (profiles.includes("ghcr-published")) failures.push(...validateGhcrPublicationWorkflow(fs));
  return failures;
}

function validateGhcrPublicationWorkflow(fs) {
  const publishPath = ".github/workflows/publish.yaml";
  if (!fs.existsSync(publishPath)) return [];
  const sections = parseWorkflow(fs.readFileSync(publishPath, "utf8"));
  const jobs = parseJobs(sections.get("jobs") ?? []);
  const publish = jobs.get("publish") ?? [];
  const failures = [];
  if (!hasTagTrigger(sections.get("on") ?? sections.get('"on"') ?? []))
    failures.push("BLOCKED: GHCR workflow must trigger for numeric version tags.");
  if (!jobs.has("publish")) failures.push("BLOCKED: GHCR workflow must contain a publish job.");
  if (jobValue(publish, "environment") !== "ghcr-publish")
    failures.push("BLOCKED: GHCR publish job must use the ghcr-publish environment.");
  if (!publish.some((line) => line.includes("docker/build-push-action@v6")))
    failures.push("BLOCKED: GHCR publish job must build and push its image with Docker.");
  return failures;
}
