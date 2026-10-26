import { jest } from "@jest/globals";
import { pollReleaseWorkflows } from "../../../../../src/commands/release-wait/release/poll/workflows.mjs";

test("polls each workflow with shared options and returns its run", async () => {
  const poll = jest
    .fn()
    .mockResolvedValueOnce({ databaseId: 1 })
    .mockResolvedValueOnce({ databaseId: 2 });
  const common = { repo: "eliware/demo", linksOnly: true };
  const workflows = [
    { workflowPath: ".github/workflows/ci.yaml", profile: "CI" },
    { workflowPath: ".github/workflows/npm.yaml", profile: "npm" },
  ];

  await expect(pollReleaseWorkflows(poll, common, workflows)).resolves.toEqual([
    { workflow: workflows[0], run: { databaseId: 1 } },
    { workflow: workflows[1], run: { databaseId: 2 } },
  ]);
  expect(poll).toHaveBeenNthCalledWith(1, {
    ...common,
    workflowPath: workflows[0].workflowPath,
    workflowLabel: workflows[0].profile,
  });
  expect(poll).toHaveBeenNthCalledWith(2, {
    ...common,
    workflowPath: workflows[1].workflowPath,
    workflowLabel: workflows[1].profile,
  });
});

test("returns no runs when no workflow applies", async () => {
  await expect(pollReleaseWorkflows(jest.fn(), {}, [])).resolves.toEqual([]);
});

test("checks each workflow start without waiting for another workflow poll", async () => {
  let resolveCi;
  const ciRun = new Promise((resolve) => {
    resolveCi = resolve;
  });
  const poll = jest.fn(({ workflowPath }) =>
    workflowPath.endsWith("ci.yaml") ? ciRun : Promise.resolve({ databaseId: 2 }),
  );
  const workflows = [
    { workflowPath: ".github/workflows/ci.yaml", profile: "CI" },
    { workflowPath: ".github/workflows/npm.yaml", profile: "npm" },
  ];

  const results = pollReleaseWorkflows(poll, {}, workflows);
  expect(poll).toHaveBeenCalledTimes(2);
  resolveCi({ databaseId: 1 });
  await expect(results).resolves.toEqual([
    { workflow: workflows[0], run: { databaseId: 1 } },
    { workflow: workflows[1], run: { databaseId: 2 } },
  ]);
});
