import preflightOptions from "../../../src/commands/release/preflight-options.mjs";

test("keeps only the preflight report option", () => {
  expect(preflightOptions()).toEqual({ report: true });
  expect(preflightOptions(false)).toEqual({ report: false });
});
