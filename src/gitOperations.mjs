function usesWebpack(packageData, fs) {
    const sections = [packageData?.dependencies, packageData?.devDependencies, packageData?.peerDependencies, packageData?.optionalDependencies];
    const hasWebpackPackage = sections.some((section) => section && Object.prototype.hasOwnProperty.call(section, 'webpack'));
    const hasWebpackConfig = fs.existsSync('webpack.config.js') || fs.existsSync('webpack.config.mjs');

    return hasWebpackPackage || hasWebpackConfig;
}

function runWebpackBuild(execSync, packageData) {
    if (packageData?.scripts && packageData.scripts.build) {
        execSync('npm run build', { stdio: 'inherit' });
        return;
    }

    if (packageData?.scripts && packageData.scripts.webpack) {
        execSync('npm run webpack', { stdio: 'inherit' });
        return;
    }

    execSync('npx webpack', { stdio: 'inherit' });
}


function updateOutdatedDependencies(execSync, log) {
    let output = '';
    try {
        output = execSync('npm outdated --json', { encoding: 'utf-8' }) || '';
    } catch (error) {
        // npm outdated exits with status 1 when outdated packages are found.
        output = error.stdout || '';
    }
    if (!output) return;

    let outdated;
    try {
        outdated = JSON.parse(output);
    } catch {
        log.warn('Unable to parse npm outdated output; continuing without latest upgrades');
        return;
    }
    for (const name of Object.keys(outdated)) {
        log.info(`Updating outdated dependency to latest: ${name}`);
        execSync(`npm install ${name}@latest`, { stdio: 'inherit' });
    }
}

function restoreFileVersion(fs, file, snapshot) {
    if (!snapshot) {
        return;
    }

    fs.writeFileSync(file, snapshot, 'utf-8');
}

export function gitOperations(execSync, fs, log, newVersion, { dryRun = false, skipChecks = false } = {}) {
    if (dryRun) {
        log.info(`Dry run: checking release ${newVersion} without changing Git or dependencies`);
        if (fs.existsSync('package.json')) {
            const packageData = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
            if (!skipChecks && packageData?.scripts?.test) {
                log.info('Dry run: running npm test');
                execSync('npm test', { stdio: 'inherit' });
            }
            if (!skipChecks && usesWebpack(packageData, fs)) {
                log.info('Dry run: running webpack build');
                runWebpackBuild(execSync, packageData);
            }
        }
        log.info(`Dry run complete: ${newVersion} was not released`);
        return;
    }
    const dateFormatted = new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}).replace(/\//g, '-');
    let packageData = null;
    let composerSnapshot = null;
    let packageSnapshot = null;

    log.info('Starting git operations');

    if (fs.existsSync('composer.json')) {
        composerSnapshot = fs.readFileSync('composer.json', 'utf-8');
    }

    if (fs.existsSync('package.json')) {
        packageSnapshot = fs.readFileSync('package.json', 'utf-8');
    }

    try {
        if (fs.existsSync('composer.json')) {
            log.info('composer.json exists - running composer update');
            execSync('COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer update', { stdio: 'inherit' });
            log.info('Running composer bump');
            execSync('COMPOSER_HOME="." COMPOSER_ALLOW_SUPERUSER=1 composer bump', { stdio: 'inherit' });
        }

        if (fs.existsSync('package.json')) {
            log.info('package.json exists - running npm install');
            execSync('npm install', { stdio: 'inherit' });
            updateOutdatedDependencies(execSync, log);
            log.info('Running npm update');
            execSync('npm update', { stdio: 'inherit' });

            const packageContent = fs.readFileSync('package.json', 'utf-8');
            packageData = JSON.parse(packageContent);

            if (packageData?.scripts && packageData.scripts.test) {
                log.info('package.json has test script - running npm test');
                execSync('npm test', { stdio: 'inherit' });
            }

            if (usesWebpack(packageData, fs)) {
                log.info('webpack detected - running webpack build');
                runWebpackBuild(execSync, packageData);
                log.info('webpack build complete');
            }
        }

        log.info('Adding all changes to git');
        execSync('git add -A', { stdio: 'inherit' });
        log.info(`Committing with message: Version ${newVersion} - ${dateFormatted}`);
        execSync(`git commit -m 'Version ${newVersion} - ${dateFormatted}'`, { stdio: 'inherit' });
        const releaseTag = `v${newVersion}`;
        log.info(`Tagging commit with tag: ${releaseTag}`);
        execSync(`git tag ${releaseTag}`, { stdio: 'inherit' });
        log.info('Pushing commits to origin');
        execSync('git push', { stdio: 'inherit' });
        log.info('Pushing tags to origin');
        execSync('git push --tags', { stdio: 'inherit' });
        log.info('Git operations complete');
    } catch (err) {
        restoreFileVersion(fs, 'composer.json', composerSnapshot);
        restoreFileVersion(fs, 'package.json', packageSnapshot);
        log.error('A command failed during git operations. Version files were restored.');
        throw err;
    }
}
