import { hasTagTrigger, jobValue, parseJobs, parseWorkflow } from "./workflow-format.mjs";

export function validateGhcrPublicationWorkflow(fs) {
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
