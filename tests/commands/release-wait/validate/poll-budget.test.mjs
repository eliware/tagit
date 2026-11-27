import validatePollBudget from "../../../../src/commands/release-wait/validate/poll-budget.mjs";

test("accepts positive poll counts and non-negative delays", () => {
  expect(() => validatePollBudget(30, 30, 10000, 10000)).not.toThrow();
});

test.each([
  [0, 30, 10000, 10000],
  [30, 0, 10000, 10000],
  [30, 30, -1, 10000],
  [30, 30, 10000, Number.NaN],
])("rejects invalid polling limits %j", (...limits) => {
  expect(() => validatePollBudget(...limits)).toThrow("polling limits");
});
