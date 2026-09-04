export function runNotesCommand({ fs, execFileSync, buildNotesReport, output }) {
  const report = buildNotesReport(fs, execFileSync);
  output(report);
  return report;
}
