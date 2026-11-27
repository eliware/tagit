export default function isCheckTimeout(error) {
  return error?.code === "ETIMEDOUT" || error?.signal === "SIGTERM";
}
