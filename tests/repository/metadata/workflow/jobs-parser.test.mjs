import { parseJobs } from "../../../../src/repository/metadata/workflow/jobs-parser.mjs";

test("parses job blocks and keeps each block's steps", () => {
  const jobs = parseJobs([
    "  test:",
    "    runs-on: ubuntu-latest",
    "    steps: []",
    "  build:",
    "    runs-on: windows-latest",
  ]);
  expect(jobs.get("test")).toEqual(["    runs-on: ubuntu-latest", "    steps: []"]);
  expect(jobs.get("build")).toEqual(["    runs-on: windows-latest"]);
});

test("ignores nested keys and lines without a job header", () => {
  expect(parseJobs(["    runs-on: ubuntu-latest", "  invalid", "    steps: []"])).toEqual(
    new Map(),
  );
});
