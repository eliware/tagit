import { classifyReleaseJobPlatforms } from "../../../../../src/github/runs/release/job/platforms.mjs";

test("classifies platforms from job labels", () => {
  const ubuntu = { name: "linux", labels: ["ubuntu-latest"] };
  const windows = { name: "windows", labels: ["windows-2025"] };
  expect(classifyReleaseJobPlatforms([ubuntu, windows])).toEqual({
    ubuntuJobs: [ubuntu],
    windowsJobs: [windows],
  });
});

test("ignores unknown runner labels", () => {
  expect(classifyReleaseJobPlatforms([{ name: "validate", labels: ["self-hosted"] }])).toEqual({
    ubuntuJobs: [],
    windowsJobs: [],
  });
});

test("ignores jobs without label arrays", () => {
  expect(classifyReleaseJobPlatforms([{ name: "validate" }])).toEqual({
    ubuntuJobs: [],
    windowsJobs: [],
  });
});
