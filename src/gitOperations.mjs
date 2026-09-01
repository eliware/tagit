import { resolveExecutable } from './processRunner.mjs';

export function commandOptions(executable, options = {}) {
    return executable.endsWith('.cmd') ? { ...options, shell: true } : options;
}

function usesWebpack(packageData, fs) {
    const sections = [packageData?.dependencies, packageData?.devDependencies, packageData?.peerDependencies, packageData?.optionalDependencies];
    const hasWebpackPackage = sections.some((section) => section && Object.prototype.hasOwnProperty.call(section, 'webpack'));
    const hasWebpackConfig = fs.existsSync('webpack.config.js') || fs.existsSync('webpack.config.mjs');

    return hasWebpackPackage || hasWebpackConfig;
}

function runWebpackBuild(execFileSync, packageData) {
    const npm = resolveExecutable('npm');
    const npx = resolveExecutable('npx');
    if (packageData?.scripts && packageData.scripts.build) {
        execFileSync(npm, ['run', 'build'], commandOptions(npm, { stdio: 'inherit' }));
        return;
    }

    if (packageData?.scripts && packageData.scripts.webpack) {
        execFileSync(npm, ['run', 'webpack'], commandOptions(npm, { stdio: 'inherit' }));
        return;
    }

    execFileSync(npx, ['webpack'], commandOptions(npx, { stdio: 'inherit' }));
}


function updateOutdatedDependencies(execFileSync, log) {
    let output = '';
    try {
        const executable = resolveExecutable('npm');
        output = execFileSync(executable, ['outdated', '--json'], commandOptions(executable, { encoding: 'utf-8' }));
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
        const executable = resolveExecutable('npm');
        execFileSync(executable, ['install', `${name}@latest`], commandOptions(executable, { stdio: 'inherit' }));
    }
}

function restoreFileVersion(fs, file, snapshot) {
    if (!snapshot) {
        return;
    }

    fs.writeFileSync(file, snapshot, 'utf-8');
}

function ensureReleaseVersion(fs, file, newVersion) {
    if (!fs.existsSync(file)) return;
    const data = JSON.parse(fs.readFileSync(file, 'utf-8'));
    let changed = false;
    if (data.version !== newVersion) {
        data.version = newVersion;
        changed = true;
    }
    if (file === 'package-lock.json' && data.packages?.['']?.version !== undefined
        && data.packages[''].version !== newVersion) {
        data.packages[''].version = newVersion;
        changed = true;
    }
    if (changed) fs.writeFileSync(file, JSON.stringify(data, null, 4), 'utf-8');
}

export function gitOperations(execFileSync, fs, log, newVersion, { dryRun = false, skipChecks = false } = {}) {
    const npm = resolveExecutable('npm');
    const runFile = (executable, args, options = {}) => {
        return execFileSync(executable, args, options);
    };
    if (dryRun) {
        log.info(`Dry run: checking release ${newVersion} without changing Git or dependencies`);
        if (fs.existsSync('package.json')) {
            const packageData = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
            if (!skipChecks && packageData?.scripts?.test) {
                log.info('Dry run: running npm test');
                execFileSync(npm, ['test'], commandOptions(npm, { stdio: 'inherit' }));
            }
            if (!skipChecks && usesWebpack(packageData, fs)) {
                log.info('Dry run: running webpack build');
                runWebpackBuild(execFileSync, packageData);
            }
        }
        log.info(`Dry run complete: ${newVersion} was not released`);
        return;
    }
    const dateFormatted = new Date().toLocaleDateString('en-US', {month: '2-digit', day: '2-digit', year: 'numeric'}).replace(/\//g, '-');
    let packageData = null;
    let composerSnapshot = null;
    let packageSnapshot = null;
    let lockfileSnapshot = null;

    log.info('Starting git operations');

    if (fs.existsSync('composer.json')) {
        composerSnapshot = fs.readFileSync('composer.json', 'utf-8');
    }

    if (fs.existsSync('package.json')) {
        packageSnapshot = fs.readFileSync('package.json', 'utf-8');
    }
    if (fs.existsSync('package-lock.json')) {
        lockfileSnapshot = fs.readFileSync('package-lock.json', 'utf-8');
    }

    try {
        if (fs.existsSync('composer.json')) {
            log.info('composer.json exists - running composer update');
            const composer = resolveExecutable('composer');
            execFileSync(composer, ['update'], commandOptions(composer, { stdio: 'inherit', env: { ...process.env, COMPOSER_HOME: '.', COMPOSER_ALLOW_SUPERUSER: '1' } }));
            log.info('Running composer bump');
            execFileSync(composer, ['bump'], commandOptions(composer, { stdio: 'inherit', env: { ...process.env, COMPOSER_HOME: '.', COMPOSER_ALLOW_SUPERUSER: '1' } }));
        }

        if (fs.existsSync('package.json')) {
            log.info('package.json exists - running npm install');
            execFileSync(npm, ['install'], commandOptions(npm, { stdio: 'inherit' }));
            updateOutdatedDependencies(execFileSync, log);
            log.info('Running npm update');
            execFileSync(npm, ['update'], commandOptions(npm, { stdio: 'inherit' }));

            // npm may rewrite root package metadata while refreshing dependencies.
            // Reassert the release version before reading, committing, and tagging.
            ensureReleaseVersion(fs, 'package.json', newVersion);
            ensureReleaseVersion(fs, 'package-lock.json', newVersion);

            const packageContent = fs.readFileSync('package.json', 'utf-8');
            packageData = JSON.parse(packageContent);

            if (packageData?.scripts && packageData.scripts.test) {
                log.info('package.json has test script - running npm test');
                const testExecutable = resolveExecutable('npm');
                execFileSync(testExecutable, ['test'], commandOptions(testExecutable, { stdio: 'inherit' }));
            }

            if (usesWebpack(packageData, fs)) {
                log.info('webpack detected - running webpack build');
                runWebpackBuild(execFileSync, packageData);
                log.info('webpack build complete');
            }
        }

        log.info('Adding all changes to git');
        // DevOps release runs begin after strict preflight on a clean tree; staging all generated metadata is intentional.
        // This function is not an owner command and must never be used as a substitute for preflight.
        runFile('git', ['add', '-A'], { stdio: 'inherit' });
        log.info(`Committing with message: Version ${newVersion} - ${dateFormatted}`);
        // JSON string quoting produces a shell argument that works in both
        // POSIX shells and Windows cmd.exe/PowerShell. POSIX single quotes
        // are passed literally by Windows and make Git treat the message
        // fragments as pathspecs.
        const commitMessage = `Version ${newVersion} - ${dateFormatted}`;
        runFile('git', ['commit', '-m', commitMessage], { stdio: 'inherit' });
        const releaseTag = `v${newVersion}`;
        log.info(`Tagging commit with tag: ${releaseTag}`);
        runFile('git', ['tag', releaseTag], { stdio: 'inherit' });
        log.info('Pushing commits to origin');
        runFile('git', ['push'], { stdio: 'inherit' });
        log.info('Pushing tags to origin');
        runFile('git', ['push', '--tags'], { stdio: 'inherit' });
        log.info('Git operations complete');
        const commitOutput = runFile('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' });
        return { commitSha: commitOutput ? commitOutput.trim() : null, tag: releaseTag };
    } catch (err) {
        restoreFileVersion(fs, 'composer.json', composerSnapshot);
        restoreFileVersion(fs, 'package.json', packageSnapshot);
        restoreFileVersion(fs, 'package-lock.json', lockfileSnapshot);
        log.error('A command failed during git operations. Version files were restored.');
        throw err;
    }
}
