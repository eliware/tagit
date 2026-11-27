import { jest } from "@jest/globals";

const verifyReleasePublicationWorkflow = jest.fn();
jest.unstable_mockModule(
  "../../../../../../src/commands/release-wait/verify/release/publication/workflow.mjs",
  () => ({ default: verifyReleasePublicationWorkflow }),
);
const { default: verifyReleasePublicationWorkflowPlan } =
  await import("../../../../../../src/commands/release-wait/verify/release/publication/workflow-plan.mjs");

test("builds the publication plan and verifies its workflow targets", () => {
  const options = {
    publication: {
      applicable: false,
      ghcrApplicable: true,
      packageName: null,
      isPrivate: false,
    },
    publicationRuns: [],
    repo: "eliware/demo",
    tag: "v1.0.0",
    log: { info: jest.fn() },
  };
  expect(verifyReleasePublicationWorkflowPlan(options)).toEqual({
    targets: [{ profile: "ghcr", packageName: "image", isPrivate: false }],
    ghcrApplicable: true,
    applicable: true,
  });
  expect(verifyReleasePublicationWorkflow).toHaveBeenCalledWith({
    targets: [{ profile: "ghcr", packageName: "image", isPrivate: false }],
    publicationRuns: options.publicationRuns,
    repo: options.repo,
    tag: options.tag,
    log: options.log,
  });
});
