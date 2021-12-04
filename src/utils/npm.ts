import { parse as parseJsonWithComments } from 'comment-json';
import {
  clean as cleanSemver,
  gt as gtSemver,
  major as majorSemver,
  minor as minorSemver,
  patch as patchSemver,
  prerelease as prereleaseSemver
} from 'semver';
import { exec } from 'shelljs';

export function smartTag(packageName: string, packageVersion: string, preReleaseTag: string, devPostfix: string) {
  const cleanPackageVersion = cleanSemver(packageVersion);

  if (!cleanPackageVersion) {
    throw new Error(`Package tarball version invalid: ${packageVersion}`);
  }

  if (cleanPackageVersion.includes(devPostfix)) {
    return [preReleaseTag];
  }

  const isPreRelease = !!prereleaseSemver(packageVersion);

  const publishedVersions = fetchPackageVersions(packageName).filter((version) => {
    const preReleaseParts = prereleaseSemver(version);
    const preReleaseExists = !!preReleaseParts;

    return (
      (isPreRelease &&
        preReleaseExists &&
        !preReleaseParts.some((part) => typeof part === 'string' && part.includes(devPostfix))) ||
      (!isPreRelease && !preReleaseExists)
    );
  });

  if (publishedVersions.includes(packageVersion)) {
    throw new Error(`Package already published with version: ${packageVersion}`);
  }

  const apv = analyzePackageVersion(packageVersion, publishedVersions);

  const tagPrefixes = [
    `v${apv.major.toString()}`,
    `v${apv.major.toString()}.${apv.minor.toString()}`,
    `v${apv.major.toString()}.${apv.minor.toString()}.${apv.patch.toString()}`
  ];

  return isPreRelease ? smartTagPreRelease(apv, tagPrefixes, preReleaseTag) : smartTagRelease(apv, tagPrefixes);
}

export function smartTagPreRelease(
  apv: AnalyzedPackageVersion,
  tagPrefixes: string[],
  preReleaseTag: string
): string[] {
  // vX~next, vX.Y~next, vX.Y.Z~next
  const availableTags = tagPrefixes.map((v) => `${v}~${preReleaseTag}`);

  if (apv.isMajorHighest) {
    if (!apv.matches.major.length) {
      // Highest new major version.
      // vX~next, vX.Y~next, vX.Y.Z~next
      return availableTags.slice();
    }

    if (apv.isMinorHighest) {
      if (!apv.matches.minor.length) {
        // Highest new minor version on highest major version.
        // vX~next, vX.Y~next, vX.Y.Z~next
        return availableTags.slice();
      }

      if (apv.isPatchHighest) {
        if (!apv.matches.patch.length || gtSemver(apv.version, apv.matches.patch.slice(-1)[0])) {
          // Highest new patch version on highest major.minor version or
          // highest pre-release version on highest major.minor.patch version.
          // vX~next, vX.Y~next, vX.Y.Z~next
          return availableTags.slice();
        }
      }

      // New patch version on highest major.minor version or
      // new pre-release version on major.minor.patch version.
      // vX.Y.Z~next
      return availableTags.slice(-1);
    }

    if (!apv.matches.minor.length || apv.isPatchHighest) {
      // New minor version on highest major version or
      // highest new patch version on major.minor version.
      // vX.Y~next, vX.Y.Z~next
      return availableTags.slice(-2);
    }

    // New pre-release version on major.minor.patch version.
    // vX.Y.Z~next
    return availableTags.slice(-1);
  }

  if (!apv.matches.major.length) {
    // New major version.
    // vX~next, vX.Y~next, vX.Y.Z~next
    return availableTags.slice();
  }

  if (apv.isMinorHighest) {
    if (!apv.matches.minor.length) {
      // Highest new minor version.
      // vX.Y~next, vX.Y.Z~next
      return availableTags.slice(-2);
    }

    if (apv.isPatchHighest) {
      if (!apv.matches.patch.length || gtSemver(apv.version, apv.matches.patch.slice(-1)[0])) {
        // Highest new patch version on highest minor version or
        // highest pre-release version on highest minor.patch version.
        // vX.Y~next, vX.Y.Z~next
        return availableTags.slice(-2);
      }
    }

    // New pre-release version on highest minor.patch version or
    // new patch version on highest minor version or
    // new pre-release version on minor.patch version.
    // vX.Y.Z~next
    return availableTags.slice(-1);
  }

  if (!apv.matches.minor.length) {
    // New minor version.
    // vX.Y~next, vX.Y.Z~next
    return availableTags.slice(-2);
  }

  if (apv.isPatchHighest) {
    if (!apv.matches.patch.length || gtSemver(apv.version, apv.matches.patch.slice(-1)[0])) {
      // Highest new patch version on highest minor version or
      // highest pre-release version on highest patch version.
      // vX.Y~next, vX.Y.Z~next
      return availableTags.slice(-2);
    }

    // New pre-release version on highest patch version.
    // vX.Y.Z~next
    return availableTags.slice(-1);
  }

  if (!apv.matches.patch.length) {
    // Highest new patch version on major.minor version.
    // vX.Y~next, vX.Y.Z~next
    return availableTags.slice(-2);
  }

  // New pre-release version on major.minor.patch version.
  // vX.Y.Z~next
  return availableTags.slice(-1);
}

export function smartTagRelease(apv: AnalyzedPackageVersion, tagPrefixes: string[]): string[] {
  const availableTags = tagPrefixes.map((v) => `${v}~latest`);

  if (apv.isMajorHighest) {
    if (!apv.matches.major.length) {
      // Highest new major version.
      // latest, vX~latest, vX.Y~latest
      return ['latest'].concat(availableTags.slice(0, -1));
    }

    if (apv.isMinorHighest) {
      if (!apv.matches.minor.length || apv.isPatchHighest) {
        // Highest new minor version on highest major version or
        // highest new patch version on highest major.minor version.
        // latest, vX~latest, vX.Y~latest
        return ['latest'].concat(availableTags.slice(0, -1));
      }

      // New patch version on highest major.minor version.
      // vX.Y.Z~latest
      return availableTags.slice(-1);
    }

    if (!apv.matches.minor.length || apv.isPatchHighest) {
      // New minor version on highest major version or
      // highest new patch version on minor version.
      // vX.Y~latest
      return availableTags.slice(1, -1);
    }

    // New patch version on minor version.
    // vX.Y.Z~latest
    return availableTags.slice(-1);
  }

  if (!apv.matches.major.length) {
    // New major version.
    // vX~latest, vX.Y~latest
    return availableTags.slice(0, -1);
  }

  if (apv.isMinorHighest) {
    if (!apv.matches.minor.length || apv.isPatchHighest) {
      // Highest new minor version on major version or
      // highest new patch version on highest minor version.
      // vX~latest, vX.Y~latest
      return availableTags.slice(0, -1);
    }

    // New patch version on highest minor version.
    // vX.Y.Z~latest
    return availableTags.slice(-1);
  }

  if (!apv.matches.minor.length || apv.isPatchHighest) {
    // New minor version on major version or
    // highest new patch version on minor version.
    // vX.Y~latest
    return availableTags.slice(1, -1);
  }

  // New patch version on minor version.
  // vX.Y.Z~latest
  return availableTags.slice(-1);
}

export function fetchPackageVersions(packageName: string) {
  const result = exec(`npm view ${packageName} versions --json`, {
    silent: true
  });

  if (result.code !== 0) {
    throw new Error(`Fetch failed:\n${result.stderr}`);
  }

  return parseJsonWithComments(result.stdout) as string[];
}

export interface AnalyzedPackageVersion {
  version: string;
  major: number;
  minor: number;
  patch: number;
  isMajorHighest: boolean;
  isMinorHighest: boolean;
  isPatchHighest: boolean;
  matches: {
    major: string[];
    minor: string[];
    patch: string[];
  };
}

export function analyzePackageVersion(packageVersion: string, versions: string[]): AnalyzedPackageVersion {
  const packageVersionMajor = majorSemver(packageVersion);
  const packageVersionMinor = minorSemver(packageVersion);
  const packageVersionPatch = patchSemver(packageVersion);

  let isPackageVersionMajorHighest = true;
  let isPackageVersionMinorHighest = true;
  let isPackageVersionPatchHighest = true;

  const matchingMajorVersions = versions.filter((version) => {
    const v = majorSemver(version);

    if (v > packageVersionMajor) {
      isPackageVersionMajorHighest = false;
      return false;
    }

    return packageVersionMajor === v;
  });

  const matchingMinorVersions = matchingMajorVersions.filter((version) => {
    const v = minorSemver(version);

    if (v > packageVersionMinor) {
      isPackageVersionMinorHighest = false;
      return false;
    }

    return packageVersionMinor === v;
  });

  const matchingPatchVersions = matchingMinorVersions.filter((version) => {
    const v = patchSemver(version);

    if (v > packageVersionPatch) {
      isPackageVersionPatchHighest = false;
      return false;
    }

    return packageVersionPatch === v;
  });

  return {
    version: packageVersion,
    major: packageVersionMajor,
    minor: packageVersionMinor,
    patch: packageVersionPatch,
    isMajorHighest: isPackageVersionMajorHighest,
    isMinorHighest: isPackageVersionMinorHighest,
    isPatchHighest: isPackageVersionPatchHighest,
    matches: {
      major: matchingMajorVersions,
      minor: matchingMinorVersions,
      patch: matchingPatchVersions
    }
  };
}
