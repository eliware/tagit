import { jobHasCommand } from "./workflow-job-rules.mjs";

export function validateNpmPublicationJob(publish) {
  const failures = [];
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
