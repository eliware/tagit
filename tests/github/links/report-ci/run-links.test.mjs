import { jest } from "@jest/globals";
import { reportCiRunLinks } from "../../../../src/github/links/report-ci/run-links.mjs";

test("reports workflow and job links", () => {
  const log = { info: jest.fn() };
  const exec = jest.fn(() => JSON.stringify({ jobs: [] }));
  reportCiRunLinks(exec, log, "eliware/demo", [{ databaseId: 1, url: "run" }]);
  expect(log.info).toHaveBeenCalledWith("Workflow: [run](run)");
  expect(log.info).toHaveBeenCalledTimes(1);
});
