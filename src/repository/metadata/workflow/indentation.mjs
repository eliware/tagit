export default function getIndentation(line) {
  return line.length - line.trimStart().length;
}
