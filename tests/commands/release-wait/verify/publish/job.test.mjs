import { selectSuccessfulPublishJobs } from "../../../../../src/commands/release-wait/verify/publish/job.mjs";

test("selects only completed successful publish jobs", () => {
  const successful = { name: "publish", status: "completed", conclusion: "success" };
  expect(
    selectSuccessfulPublishJobs([
      successful,
      { name: "PUBLISH", status: "completed", conclusion: "success" },
      { name: "publish image", status: "completed", conclusion: "success" },
      { name: "publish", status: "in_progress", conclusion: "" },
      { name: "publish", status: "completed", conclusion: "failure" },
    ]),
  ).toEqual([successful, { name: "PUBLISH", status: "completed", conclusion: "success" }]);
});
