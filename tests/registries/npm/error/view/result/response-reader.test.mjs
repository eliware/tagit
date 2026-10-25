import { readNpmViewResponse } from "../../../../../../src/registries/npm/error/view/result/response-reader.mjs";

test.each([
  ['"1.0.0"', "1.0.0"],
  ['["1.0.0"]', ["1.0.0"]],
  ['["1.0.0", "1.0.1"]', ["1.0.0", "1.0.1"]],
  ['""', ""],
])("reads npm view JSON response %s", (output, expected) => {
  expect(readNpmViewResponse(output)).toEqual(expected);
});

test("rejects malformed npm view JSON", () => {
  expect(() => readNpmViewResponse("not-json")).toThrow();
});
