export function incrementVersion(version) {
    if (!/^\d+\.\d+\.\d+$/.test(String(version))) {
        throw new Error(`Invalid version: ${version}`);
    }
    const parts = version.split('.').map(Number);
    parts[parts.length - 1]++;
    return parts.join('.');
}
