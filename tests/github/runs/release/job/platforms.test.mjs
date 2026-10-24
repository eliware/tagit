import { classifyReleaseJobPlatforms } from "../../../../../src/github/runs/release/job/platforms.mjs";

test("classifies platforms from job labels", () => {
  const ubuntu = { name: "linux", labels: ["ubuntu-latest"] };
  const windows = { name: "windows", labels: ["windows-2025"] };
  expect(classifyReleaseJobPlatforms([ubuntu, windows])).toEqual({
    ubuntuJobs: [ubuntu],
    windowsJobs: [windows],
  });
});

test("uses workflow runner labels when job labels are absent", () => {
  const job = { name: "validate" };
  expect(classifyReleaseJobPlatforms([job], { validate: ["ubuntu"] })).toEqual({
    ubuntuJobs: [job],
    windowsJobs: [],
  });
});

test("ignores unknown runner labels", () => {
  expect(classifyReleaseJobPlatforms([{ name: "validate", labels: ["self-hosted"] }])).toEqual({
    ubuntuJobs: [],
    windowsJobs: [],
  });
});
