import { verifyReleaseCi } from "./ci.mjs";

export async function checkReleaseCi({ poll, common, log, repo, tag, runnerLabelsByJobName }) {
  const run = await poll({
    ...common,
    workflowPath: ".github/workflows/ci.yaml",
    workflowLabel: "CI",
  });
  verifyReleaseCi(log, repo, tag, run, runnerLabelsByJobName);
}
