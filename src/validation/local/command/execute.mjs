import validateTestCommand from "./policy.mjs";

export default function buildTestCheck(fs) {
  if (!fs.existsSync("package.json")) return { missing: true, check: null };
  const packageData = JSON.parse(fs.readFileSync("package.json", "utf8"));
  const status = validateTestCommand(packageData, fs);
  if (status === "missing") return { missing: true, check: null };
  if (status === "invalid") return { missing: false, invalid: true, check: null };
  return { missing: false, check: ["test", ["npm", ["test"]]] };
}
