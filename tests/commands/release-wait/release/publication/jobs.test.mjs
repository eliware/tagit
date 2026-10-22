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
  applicable: true,
  isPrivate: false,
  repo: "eliware/demo",
  tag: "v1.0.0",
  log: { info: jest.fn() },
};

test("validates and reports each applicable publication workflow", () => {
  expect(() => verifyPublicationJobs(base)).not.toThrow();
  expect(base.log.info).toHaveBeenCalledWith(
    "Release npm workflow verified for eliware/demo@v1.0.0.",
  );
});

test("accepts stale validation status when the successful publish workflow has passing steps", () => {
  const publication = {
    profile: "npm",
    run: {
      status: "completed",
      conclusion: "success",
      jobs: [
        {
          name: "validate",
          labels: ["ubuntu-latest"],
          status: "in_progress",
          conclusion: null,
          steps: [{ name: "npm test", status: "completed", conclusion: "success" }],
        },
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

test("requires a passing publish job for public npm targets", () => {
  expect(() =>
    verifyPublicationJobs({
      ...base,
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
            ],
          },
        },
      ],
    }),
  ).toThrow("lacks a passing publish job");
});
