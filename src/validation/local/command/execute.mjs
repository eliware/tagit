import { testWaiverArguments } from "../waiver-arguments.mjs";
import { validateTestCommand } from "./policy.mjs";

export function buildTestCheck(fs, { ignore100x4 = false, ignoreMonolithLimits = false } = {}) {
  if (!fs.existsSync("package.json")) return { missing: true, check: null };
  const packageData = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const status = validateTestCommand(packageData, fs);
  if (status === "missing") return { missing: true, check: null };
  if (status === "invalid") return { missing: false, invalid: true, check: null };
  const wrapperArguments = testWaiverArguments({ ignore100x4, ignoreMonolithLimits });
  return { missing: false, check: ["test", ["npm", ["test", ...wrapperArguments]]] };
}
