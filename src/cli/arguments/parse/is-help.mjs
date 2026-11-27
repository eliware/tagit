export default function isHelp(argv) {
  return argv.includes("--help") || argv.includes("-h");
}
