import parseGhcrVersionsResponse from "../parse/versions-response.mjs";
import readGhcrVersionsOutput from "./endpoint/reader.mjs";

export default async function lookupGhcrVisibleImage(execFile, { owner, imageName, version }) {
  const output = await readGhcrVersionsOutput(execFile, owner, imageName);
  return parseGhcrVersionsResponse(output, version);
}
