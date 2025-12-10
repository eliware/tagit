export function incrementVersion(version) {
    const parts = version.split('.').map(Number);
    parts[parts.length - 1]++;
    return parts.join('.');
}
