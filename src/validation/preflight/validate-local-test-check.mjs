import buildTestCheck from "../local/command/execute.mjs";

export default function validateLocalTestCheck(fs) {
  return buildTestCheck(fs);
}
