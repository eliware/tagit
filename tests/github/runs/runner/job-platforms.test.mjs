import { classifyJobsByPlatform } from "../../../../src/github/runs/runner/job-platforms.mjs";

test("classifies Ubuntu and Windows jobs by runner labels", () => {
  const ubuntu = { name: "linux", labels: ["ubuntu-latest"] };
  const windows = { name: "windows", labels: ["windows-2025"] };
  expect(classifyJobsByPlatform([ubuntu, windows])).toEqual({
    ubuntuJobs: [ubuntu],
    windowsJobs: [windows],
  });
});

test("ignores unknown runner labels and missing label arrays", () => {
  expect(
    classifyJobsByPlatform([{ name: "runner", labels: ["self-hosted"] }, { name: "none" }]),
  ).toEqual({
    ubuntuJobs: [],
    windowsJobs: [],
  });
});
