import { jest } from "@jest/globals";
import { reportReleaseCiLinks } from "../../../../../src/commands/release-wait/verify/release/link-report.mjs";

test("reports workflow and successful Ubuntu links", () => {
  const log = { info: jest.fn() };
  reportReleaseCiLinks(
    log,
    "eliware/tagit",
    "v1.0.0",
    {
      url: "https://github.com/eliware/tagit/actions/runs/1",
      jobs: [
        {
          labels: ["ubuntu-latest"],
          status: "completed",
          conclusion: "success",
          url: "https://github.com/eliware/tagit/actions/runs/1/jobs/2",
        },
      ],
    },
    [],
  );
  expect(log.info.mock.calls.map(([message]) => message)).toEqual([
    "Release CI verified for eliware/tagit@v1.0.0:",
    "Workflow: [https://github.com/eliware/tagit/actions/runs/1](https://github.com/eliware/tagit/actions/runs/1)",
    "Ubuntu: [https://github.com/eliware/tagit/actions/runs/1/jobs/2](https://github.com/eliware/tagit/actions/runs/1/jobs/2)",
  ]);
});

test("reports no optional Windows link when there is no successful Windows job", () => {
  const log = { info: jest.fn() };
  reportReleaseCiLinks(log, "eliware/tagit", "v1.0.0", { jobs: [] }, []);
  expect(log.info).toHaveBeenCalledTimes(1);
});
