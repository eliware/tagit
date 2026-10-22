import { jest } from "@jest/globals";
import { readJobLinks } from "../../../../src/github/links/report-ci/read-job-links.mjs";

const run = { databaseId: 7 };

test("reads job records for a workflow run", () => {
  const jobs = [{ name: "Ubuntu", url: "https://ci/job/1" }, { name: "Windows" }];
  const exec = jest.fn(() => JSON.stringify({ jobs }));
  expect(readJobLinks(exec, "eliware/demo", run)).toEqual(jobs);
  expect(exec).toHaveBeenCalledWith(
    "gh",
    ["run", "view", "7", "--repo", "eliware/demo", "--json", "jobs"],
    { encoding: "utf8" },
  );
});

test("rejects a response without a job array", () => {
  expect(() =>
    readJobLinks(
      jest.fn(() => JSON.stringify({ jobs: null })),
      "eliware/demo",
      run,
    ),
  ).toThrow("GitHub CI run 7 returned malformed job records.");
});

test.each([null, 42, { url: "https://ci/job/1" }, { name: "Ubuntu", url: 42 }])(
  "rejects malformed job record %p",
  (job) => {
    expect(() =>
      readJobLinks(
        jest.fn(() => JSON.stringify({ jobs: [job] })),
        "eliware/demo",
        run,
      ),
    ).toThrow("GitHub CI run 7 returned malformed job records: 1.");
  },
);
