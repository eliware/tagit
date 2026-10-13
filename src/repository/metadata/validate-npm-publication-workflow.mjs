import { jobHasCommand } from "./workflow-job-rules.mjs";
import { parseJobs, parseWorkflow } from "./workflow-format.mjs";

function validateNpmPublicationJob(publish) {
  const failures = [];
  const npmInstall = publish.findIndex(
    (line) => line.trim() === "- run: npm -g install npm@latest",
  );
  const npmCi = publish.findIndex((line) => line.trim() === "- run: npm ci");
  const npmPublish = publish.findIndex((line) => line.trim() === "- run: npm publish --provenance");
  if (!jobHasCommand(publish, "npm -g install npm@latest"))
    failures.push("BLOCKED: publication job must install npm@latest before npm ci.");
  if (!jobHasCommand(publish, "npm ci")) failures.push("BLOCKED: publication job must run npm ci.");
  if (!jobHasCommand(publish, "npm publish --provenance"))
    failures.push("BLOCKED: publication job must publish with npm provenance.");
  if (npmInstall >= 0 && npmCi >= 0 && npmInstall > npmCi)
    failures.push("BLOCKED: publication job must install npm@latest before npm ci.");
  if (npmCi >= 0 && npmPublish >= 0 && npmCi > npmPublish)
    failures.push("BLOCKED: publication job must run npm ci before npm publish.");
  if (publish.some((line) => /NPM_TOKEN|NODE_AUTH_TOKEN/.test(line)))
    failures.push(
      "BLOCKED: publication workflow must use Trusted Publishing without static npm tokens.",
    );
  if (!publish.some((line) => line.trim() === "id-token: write"))
    failures.push("BLOCKED: publication job must grant id-token: write.");
  return failures;
}

export function validateNpmPublicationWorkflow(fs) {
  const publishPath = ".github/workflows/publish.yaml";
  if (!fs.existsSync(publishPath)) return [];
  const sections = parseWorkflow(fs.readFileSync(publishPath, "utf8"));
  const jobs = parseJobs(sections.get("jobs") ?? []);
  return validateNpmPublicationJob(jobs.get("publish") ?? []);
}
