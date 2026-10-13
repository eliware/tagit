import { hasTagTrigger } from "./tag-trigger.mjs";
import { jobHasUse, jobValue } from "./workflow-job-rules.mjs";
import { parseJobs, parseWorkflow } from "./workflow-format.mjs";
import { validateNpmPublicationJob } from "./validate-npm-publication-workflow.mjs";

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
  failures.push(...validateNpmPublicationJob(publish));
  return failures;
}
