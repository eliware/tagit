import { parseJobs, parseWorkflow } from "./workflow-format.mjs";
import { hasTagTrigger } from "./tag-trigger.mjs";
import { jobValue } from "./workflow-job-rules.mjs";

function indentation(line) {
  return line.length - line.trimStart().length;
}

function hasImagePush(publish) {
  for (let index = 0; index < publish.length; index += 1) {
    if (!publish[index].trim().match(/^- uses: docker\/build-push-action@v6$/)) continue;
    const stepIndent = indentation(publish[index]);
    const stepEnd = publish.findIndex(
      (line, candidate) =>
        candidate > index && indentation(line) <= stepIndent && line.trimStart().startsWith("- "),
    );
    const step = publish.slice(index + 1, stepEnd < 0 ? undefined : stepEnd);
    const withIndex = step.findIndex(
      (line) => indentation(line) > stepIndent && line.trim() === "with:",
    );
    if (withIndex < 0) continue;
    const withIndent = indentation(step[withIndex]);
    const withEnd = step.findIndex(
      (line, candidate) => candidate > withIndex && indentation(line) <= withIndent,
    );
    if (
      step
        .slice(withIndex + 1, withEnd < 0 ? undefined : withEnd)
        .some((line) => indentation(line) > withIndent && line.trim() === "push: true")
    )
      return true;
  }
  return false;
}

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
  if (!hasImagePush(publish))
    failures.push("BLOCKED: GHCR publish job must use Docker build-push-action with push: true.");
  return failures;
}
