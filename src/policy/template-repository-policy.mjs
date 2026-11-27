export default function isTemplateRepository(fs) {
  return fs.existsSync(".notag");
}
