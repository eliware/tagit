import { windowsCiPolicy } from "../../src/policy/windows-ci-policy.mjs";

const successful = (job) => job.status === "completed" && job.conclusion === "success";
test("treats absent Windows CI as optional", () => {
  expect(
    windowsCiPolicy(
      [{ name: "Ubuntu", labels: ["ubuntu-latest"], status: "completed", conclusion: "success" }],
      successful,
    ),
  ).toEqual({
    present: false,
    passed: true,
    successful: false,
  });
});
test("requires present Windows jobs to pass", () => {
  const jobs = [
    { name: "Windows", labels: ["windows-latest"], status: "completed", conclusion: "failure" },
  ];
  expect(windowsCiPolicy(jobs, successful)).toMatchObject({ present: true, passed: false });
  jobs[0].conclusion = "success";
  expect(windowsCiPolicy(jobs, successful)).toMatchObject({
    present: true,
    passed: true,
    successful: true,
  });
});
