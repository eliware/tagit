import { resolveExecutable } from './processRunner.mjs';

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


function updateOutdatedDependencies(execSync, log, execFileSync = null) {
    let output = '';
    try {
        output = execFileSync ? execFileSync(resolveExecutable('npm'), ['outdated', '--json'], { encoding: 'utf-8' }) : execSync('npm outdated --json', { encoding: 'utf-8' });
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
        if (execFileSync) execFileSync(resolveExecutable('npm'), ['install', `${name}@latest`], { stdio: 'inherit' });
        else execSync(`npm install ${name}@latest`, { stdio: 'inherit' });
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

export function gitOperations(execSync, fs, log, newVersion, { dryRun = false, skipChecks = false, execFileSync = null } = {}) {
    const npm = resolveExecutable('npm');
    const runFile = (executable, args, options = {}) => {
        if (execFileSync) return execFileSync(executable, args, options);
        const command = executable === 'git' && args[0] === 'commit'
            ? `git commit -m ${JSON.stringify(args[2])}` : `${executable} ${args.join(' ')}`;
        return execSync(command, options);
    };
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
            if (execFileSync) execFileSync(npm, ['install'], { stdio: 'inherit' }); else execSync('npm install', { stdio: 'inherit' });
            updateOutdatedDependencies(execSync, log, execFileSync);
            log.info('Running npm update');
            if (execFileSync) execFileSync(npm, ['update'], { stdio: 'inherit' }); else execSync('npm update', { stdio: 'inherit' });

            // npm may rewrite root package metadata while refreshing dependencies.
            // Reassert the release version before reading, committing, and tagging.
            ensureReleaseVersion(fs, 'package.json', newVersion);
            ensureReleaseVersion(fs, 'package-lock.json', newVersion);

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
        log.error('A command failed during git operations. Version files were restored.');
        throw err;
    }
}
