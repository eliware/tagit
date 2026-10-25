import { jest } from "@jest/globals";

const readJobLinks = jest.fn();
jest.unstable_mockModule("../../../../src/github/links/report-ci/read-job-links.mjs", () => ({
  readJobLinks,
}));
const { reportCiJobLinks } = await import("../../../../src/github/links/report-ci/job-links.mjs");

beforeEach(() => jest.clearAllMocks());

test("reports jobs that have links", () => {
  readJobLinks.mockReturnValue([{ name: "Ubuntu", url: "job-url" }, { name: "Windows" }]);
  const log = { info: jest.fn() };
  const execFileSync = jest.fn();
  const run = { databaseId: 1 };
  reportCiJobLinks(execFileSync, log, "eliware/demo", run);
  expect(readJobLinks).toHaveBeenCalledWith(execFileSync, "eliware/demo", run);
  expect(log.info).toHaveBeenCalledTimes(1);
  expect(log.info).toHaveBeenCalledWith("Ubuntu: [job-url](job-url)");
});
