import { verifyReleaseCi } from "../../../../../src/commands/release-wait/verify/release/ci.mjs";

test("returns accepted optional Windows jobs from release CI verification", () => {
  const windowsJob = {
    name: "test",
    labels: ["windows-latest"],
    status: "completed",
    conclusion: "success",
  };
  const result = verifyReleaseCi({
    jobs: [
      {
        name: "validate",
        labels: ["ubuntu-latest"],
        status: "completed",
        conclusion: "success",
      },
      windowsJob,
    ],
  });

  expect(result).toEqual([windowsJob]);
});
