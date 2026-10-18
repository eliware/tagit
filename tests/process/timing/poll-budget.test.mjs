import { validatePollBudget } from "../../../src/process/timing/poll-budget.mjs";

test("accepts positive poll counts and non-negative delays", () => {
  expect(() => validatePollBudget(30, 30, 10000, 10000)).not.toThrow();
});
test("rejects invalid polling limits", () => {
  expect(() => validatePollBudget(0, 30, 10000, 10000)).toThrow("polling limits");
  expect(() => validatePollBudget(30, 30, -1, 10000)).toThrow("polling limits");
});
