import {
  hasTagTrigger,
  jobHasCommand,
  jobHasUse,
  jobValue,
  parseJobs,
  parseWorkflow,
} from "./workflow-format.mjs";

export function validatePublicationWorkflow(fs) {
  const publishPath = ".github/workflows/publish.yaml";
  if (!fs.existsSync(publishPath)) return [];
  const sections = parseWorkflow(fs.readFileSync(publishPath, "utf8"));
  const jobs = parseJobs(sections.get("jobs") ?? []);
  const publish = jobs.get("publish") ?? [];
  const failures = [];
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
  return failures;
}
