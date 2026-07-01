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

function restoreFileVersion(fs, file, snapshot) {
    if (!snapshot) {
        return;
    }

    fs.writeFileSync(file, snapshot, 'utf-8');
}

export function gitOperations(execSync, fs, log, newVersion) {
    const date = new Date().toISOString().split('T')[0];
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
            log.info('package.json exists - running npm update');
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
        log.info(`Tagging commit with tag: ${newVersion}`);
        execSync(`git tag ${newVersion}`, { stdio: 'inherit' });
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
