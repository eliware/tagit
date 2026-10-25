import { buildPublicationWorkflowTargets } from "../../../../src/commands/release-wait/read/workflow-targets.mjs";

test.each([
  [null, false, []],
  [
    { workflowPath: ".github/workflows/npm.yaml", profile: "npm" },
    false,
    [{ workflowPath: ".github/workflows/npm.yaml", profile: "npm" }],
  ],
  [null, true, [{ workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" }]],
  [
    { workflowPath: ".github/workflows/npm.yaml", profile: "npm" },
    true,
    [
      { workflowPath: ".github/workflows/npm.yaml", profile: "npm" },
      { workflowPath: ".github/workflows/ghcr.yaml", profile: "ghcr" },
    ],
  ],
])(
  "combines the discovered npm workflow with GHCR applicability",
  (npmWorkflow, ghcrApplicable, expected) => {
    expect(buildPublicationWorkflowTargets(npmWorkflow, ghcrApplicable)).toEqual(expected);
  },
);
