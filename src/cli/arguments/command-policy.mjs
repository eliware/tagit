import parseVersionOption from "./parse/version-option.mjs";

export default function validateCommandPolicy(argv, command) {
  if (argv.includes("--dry-run") && !["push", "release"].includes(command))
    throw new Error("--dry-run requires push or release.");
  if (command && argv.includes("--version") && !["release", "release-wait"].includes(command))
    throw new Error(
      "--version requires release or release-wait. Use --version alone to query tagit.",
    );
  if (command === "release-wait" && argv.includes("--version"))
    throw new Error("release-wait always checks the latest tag. Do not pass --version.");
  if (command === "release") parseVersionOption(argv, { required: true });
}
