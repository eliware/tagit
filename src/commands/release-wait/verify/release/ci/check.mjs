import { verifyReleaseCi } from "../ci.mjs";
import { reportReleaseCiLinks } from "./links.mjs";

export async function checkReleaseCi({ poll, common, log, repo, tag, runnerLabelsByJobName }) {
  const run = await poll({
    ...common,
    workflowPath: ".github/workflows/ci.yaml",
    workflowLabel: "CI",
  });
  const windowsJobs = verifyReleaseCi(run, runnerLabelsByJobName);
  reportReleaseCiLinks(log, repo, tag, run, windowsJobs);
}
