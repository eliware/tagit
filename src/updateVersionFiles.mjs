import { incrementVersion } from './incrementVersion.mjs';

export async function updateVersionFiles(fs, log, { dryRun = false, targetVersion = null } = {}) {
  const composerFile = 'composer.json';
  const packageFile = 'package.json';
  let newVersion = null;
  if (targetVersion !== null && !/^\d+\.\d+\.\d+$/.test(targetVersion)) {
    throw new Error(`Invalid target version: ${targetVersion}`);
  }

  if (fs.existsSync(composerFile)) {
    log.info(`Reading ${composerFile}`);
    const composerContent = fs.readFileSync(composerFile, 'utf-8');
    const composerData = JSON.parse(composerContent);

    if (!composerData.version) {
      throw new Error('Version not found in composer.json.');
    }

    newVersion = targetVersion ?? incrementVersion(composerData.version);
    log.info(`Incremented composer.json version from ${composerData.version} to ${newVersion}`);
    composerData.version = newVersion;

    const newContent = `${JSON.stringify(composerData, null, 4)}\n`;
    if (dryRun) log.info(`Dry run: would write updated version to ${composerFile}`);
    else {
      fs.writeFileSync(composerFile, newContent);
      log.info(`Wrote updated version to ${composerFile}`);
    }
  }

  if (fs.existsSync(packageFile)) {
    log.info(`Reading ${packageFile}`);
    const packageContent = fs.readFileSync(packageFile, 'utf-8');
    const packageData = JSON.parse(packageContent);

    if (!packageData.version) {
      throw new Error('Version not found in package.json.');
    }

    if (!newVersion) {
      newVersion = targetVersion ?? incrementVersion(packageData.version);
      log.info(`Incremented package.json version to ${newVersion}`);
    } else {
      log.info(`Syncing package.json version to ${newVersion}`);
    }
    packageData.version = newVersion;

    const newPkgContent = `${JSON.stringify(packageData, null, 4)}\n`;
    if (dryRun) log.info(`Dry run: would write updated version to ${packageFile}`);
    else {
      fs.writeFileSync(packageFile, newPkgContent);
      log.info(`Wrote updated version to ${packageFile}`);
    }
  }

  return newVersion;
}
