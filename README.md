# [![eliware.org](https://eliware.org/logos/brand.png)](https://discord.gg/M6aTR9eTwN)

## @eliware/tagit [![npm version](https://img.shields.io/npm/v/@eliware/tagit.svg)](https://www.npmjs.com/package/@eliware/tagit) [![license](https://img.shields.io/github/license/eliware/tagit.svg)](LICENSE) [![build status](https://github.com/eliware/tagit/actions/workflows/nodejs.yml/badge.svg)](https://github.com/eliware/tagit/actions)

Automated version management and Git operations for Node.js and PHP projects.

**Note:** `tagit` is intended for use on Linux systems only.

---

## Table of Contents

- [What is tagit?](#what-is-tagit)
- [Features](#features)
- [Usage](#usage)
- [Support](#support)
- [License](#license)
- [Links](#links)

## What is tagit?

`tagit` is a CLI utility that automates the process of incrementing your project version, updating version files (`package.json` and/or `composer.json`), committing the changes, tagging the commit, and pushing to your Git repository. It provides detailed logging and robust error handling for a smooth release workflow.

## Features

- Increments the semantic version in `package.json` and/or `composer.json`
- Writes the new version back to the file(s)
- Commits all changes with a message like: `Version <version> - MM-DD-YYYY`
- Tags the commit with the new version
- Pushes commits and tags to your remote repository
- Logs each step for transparency

## Installation

Clone the repository (suggested location: `/opt`):

```bash
sudo git clone https://github.com/eliware/tagit.git /opt/tagit
cd /opt/tagit
sudo npm install
# (Optional) Run tests
sudo npm test
```

Create a symlink to make `tagit` available system-wide:

```bash
sudo ln -s /opt/tagit/tagit.mjs /usr/bin/tagit
```

## Usage

Switch to the root directory of the project you want to bump the version for, then run:

```bash
tagit
```

If you have not created the symlink, you can run it directly with:

```bash
/opt/tagit/tagit.mjs
```

## Support

For help or questions, join the community and chat with the author:

[![Discord](https://eliware.org/logos/discord_96.png)](https://discord.gg/M6aTR9eTwN)  
**[eliware.org on Discord](https://discord.gg/M6aTR9eTwN)**

## License

[MIT © 2025 Eli Sterling, eliware.org](LICENSE)

## Links

- [Home Page](https://eliware.org)
- [GitHub Repo](https://github.com/eliware/tagit)
- [GitHub Org](https://github.com/eliware)
- [GitHub Personal](https://github.com/eli-sterling)
- [Discord](https://discord.gg/M6aTR9eTwN)
