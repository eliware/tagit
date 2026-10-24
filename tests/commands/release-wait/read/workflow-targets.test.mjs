import { buildPublicationWorkflowTargets } from "../../../../src/commands/release-wait/read/workflow-targets.mjs";

test.each([
  [false, false, []],
  [true, false, [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }]],
  [false, true, [{ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" }]],
  [
    true,
    true,
    [
      { workflowPath: ".github/workflows/npm.yaml", profile: "npm" },
      { workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" },
    ],
  ],
])("builds workflow targets for npm=%s and ghcr=%s", (npmApplicable, ghcrApplicable, expected) => {
  expect(buildPublicationWorkflowTargets(npmApplicable, ghcrApplicable)).toEqual(expected);
});
