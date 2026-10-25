import { jest } from "@jest/globals";
import { verifyReleasePublicationJobs } from "../../../../../../src/commands/release-wait/verify/release/publication/jobs.mjs";

test("verifies publication jobs and reports their links", () => {
  const log = { info: jest.fn() };
  const publishJob = {
    name: "publish",
    status: "completed",
    conclusion: "success",
    url: "publish-url",
  };
  const result = verifyReleasePublicationJobs({
    targets: [{ profile: "npm", packageName: "demo", isPrivate: false }],
    publicationRuns: [{ profile: "npm", run: { jobs: [publishJob] } }],
    applicable: true,
    isPrivate: false,
    repo: "eliware/demo",
    tag: "v1.0.0",
    log,
  });

  expect(result).toEqual([{ profile: "npm", publishJobs: [publishJob] }]);
  expect(log.info).toHaveBeenCalledWith("npm: [publish-url](publish-url)");
});
