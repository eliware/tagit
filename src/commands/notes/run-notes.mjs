export function runNotesCommand({ execFileSync, buildNotesReport, output }) {
  const report = buildNotesReport(execFileSync);
  output(report);
  return report;
}
