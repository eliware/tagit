import { jest } from "@jest/globals";
import { verifyPublicationJobs } from "../../../../../src/commands/release-wait/release/publication/jobs.mjs";

const base = {
  targets: [{ profile: "npm", packageName: "demo", isPrivate: false }],
  publicationRuns: [
    {
      profile: "npm",
      run: {
        jobs: [
          {
            name: "validate",
            labels: ["ubuntu-latest"],
            status: "completed",
            conclusion: "success",
          },
          { name: "publish", status: "completed", conclusion: "success", url: "publish-url" },
        ],
      },
    },
  ],
  runnerLabelsByJobName: {},
  repo: "eliware/demo",
  tag: "v1.0.0",
  log: { info: jest.fn() },
};

test("verifies each applicable publication workflow and returns its passing jobs", () => {
  expect(verifyPublicationJobs(base)).toEqual([
    { profile: "npm", publishJobs: [base.publicationRuns[0].run.jobs[1]] },
  ]);
  expect(base.log.info).toHaveBeenCalledWith(
    "Release npm workflow verified for eliware/demo@v1.0.0.",
  );
});

test("checks publication jobs without repeating general CI job policy", () => {
  const publication = {
    profile: "npm",
    run: {
      status: "completed",
      conclusion: "success",
      jobs: [
        { name: "validate", status: "completed", conclusion: "failure" },
        { name: "publish", status: "completed", conclusion: "success", url: "publish-url" },
      ],
    },
  };
  expect(() => verifyPublicationJobs({ ...base, publicationRuns: [publication] })).not.toThrow();
});

test("requires a completed run for every applicable publication workflow", () => {
  expect(() => verifyPublicationJobs({ ...base, publicationRuns: [] })).toThrow(
    "npm workflow did not complete",
  );
});

test("rejects malformed publication jobs", () => {
  expect(() =>
    verifyPublicationJobs({
      ...base,
      publicationRuns: [{ profile: "npm", run: { jobs: null } }],
    }),
  ).toThrow("malformed job records");
});

test.each([
  ["public npm", { profile: "npm", packageName: "demo", isPrivate: false }],
  ["private unnamed npm", { profile: "npm", packageName: null, isPrivate: true }],
  ["GHCR", { profile: "ghcr", packageName: "image", isPrivate: false }],
])("requires a passing publish job for %s targets", (_name, target) => {
  expect(() =>
    verifyPublicationJobs({
      ...base,
      targets: [target],
      publicationRuns: [
        {
          profile: target.profile,
          run: {
            jobs: [
              {
                name: "validate",
                labels: ["ubuntu-latest"],
                status: "completed",
                conclusion: "success",
              },
            ],
          },
        },
      ],
    }),
  ).toThrow("lacks a passing publish job");
});
