import {
  analyzePackageVersion,
  fetchPackageVersions,
  smartTag,
  smartTagPreRelease,
  smartTagRelease
} from '../../src/utils/npm';

describe('npm', () => {
  // Squelch console output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  //////////////////////////////////////////////////////////////////////////////
  /// smartTag
  //////////////////////////////////////////////////////////////////////////////

  describe('smartTag', () => {
    it('throws error when version is invalid', () =>
      expect(() => smartTag('test', 'failit', 'next', 'dev-build')).toThrow(/.*Package tarball version invalid.*/));

    it('throws error when version already exists in NPM registry', () =>
      expect(() => smartTag('semver', '1.0.0', 'next', 'beta')).toThrow(/.*Package already published with version.*/));

    it('returns pre-release tag if version contains devPostfix', () =>
      expect(smartTag('test', '0.0.0--dev-build.1234567890', 'next', 'dev-build')).toEqual(['next']));

    it('handles pre-release tagging', () =>
      expect(smartTag('semver', '99.99.99-alpha', 'next', 'beta')).toEqual([
        'v99~next',
        'v99.99~next',
        'v99.99.99~next'
      ]));

    it('handles release tagging', () =>
      expect(smartTag('semver', '99.99.99', 'next', 'beta')).toEqual(['latest', 'v99~latest', 'v99.99~latest']));
  });

  //////////////////////////////////////////////////////////////////////////////
  /// smartTagPreRelease
  //////////////////////////////////////////////////////////////////////////////

  describe('smartTagPreRelease', () => {
    it('handles an initial prerelease', () => {
      const tags = smartTagPreRelease(
        {
          version: '0.0.0-alpha',
          major: 0,
          minor: 0,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: [],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.0', 'v0.0.0'],
        'next'
      );

      expect(tags).toEqual(['v0~next', 'v0.0~next', 'v0.0.0~next']);
    });

    it('handles a new minor version or highest patch version when major version is highest', () => {
      let tags = smartTagPreRelease(
        {
          version: '0.1.0-alpha',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0'],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0'],
        'next'
      );

      expect(tags).toEqual(['v0~next', 'v0.1~next', 'v0.1.0~next']);

      tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: true,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0'],
            minor: ['0.1.0'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0~next', 'v0.1~next', 'v0.1.1~next']);

      tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha.1',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: true,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0', '0.1.1-alpha'],
            minor: ['0.1.0', '0.1.1-alpha'],
            patch: ['0.1.1-alpha']
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0~next', 'v0.1~next', 'v0.1.1~next']);
    });

    it('handles edge case where patch version is lower than others when major & minor version is highest', () => {
      const tags = smartTagPreRelease(
        {
          version: '0.1.0-alpha',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: true,
          isPatchHighest: false,
          matches: {
            major: ['0.0.0', '0.1.1'],
            minor: ['0.1.1'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0'],
        'next'
      );

      expect(tags).toEqual(['v0.1.0~next']);
    });

    it('handles new minor version or highest patch version when major version is highest but minor version is not', () => {
      let tags = smartTagPreRelease(
        {
          version: '0.1.0-alpha',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.2.0'],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0'],
        'next'
      );

      expect(tags).toEqual(['v0.1~next', 'v0.1.0~next']);

      tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: true,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0', '0.2.0'],
            minor: ['0.1.0'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0.1~next', 'v0.1.1~next']);
    });

    it('handles edge case where patch version is lower than others when major version is highest but minor version is not', () => {
      const tags = smartTagPreRelease(
        {
          version: '0.1.0-alpha',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: false,
          isPatchHighest: false,
          matches: {
            major: ['0.0.0', '0.1.1', '0.2.0'],
            minor: ['0.1.1'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0'],
        'next'
      );

      expect(tags).toEqual(['v0.1.0~next']);
    });

    it('handles edge case where major version is new but is not highest', () => {
      const tags = smartTagPreRelease(
        {
          version: '0.0.0-alpha',
          major: 0,
          minor: 0,
          patch: 0,
          isMajorHighest: false,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: [],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.0', 'v0.0.0'],
        'next'
      );

      expect(tags).toEqual(['v0~next', 'v0.0~next', 'v0.0.0~next']);
    });

    it('handles a new minor version or highest patch version when major version is not highest but minor version is', () => {
      let tags = smartTagPreRelease(
        {
          version: '0.1.0-alpha',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: false,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0'],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0'],
        'next'
      );

      expect(tags).toEqual(['v0.1~next', 'v0.1.0~next']);

      tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: false,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0'],
            minor: ['0.1.0'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0.1~next', 'v0.1.1~next']);

      tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha.1',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: false,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0', '0.1.1-alpha'],
            minor: ['0.1.0', '0.1.1-alpha'],
            patch: ['0.1.1-alpha']
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0.1~next', 'v0.1.1~next']);
    });

    it('handles edge case where patch version is lower than others when major version is not highest but minor version is highest', () => {
      const tags = smartTagPreRelease(
        {
          version: '0.1.0-alpha',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: false,
          isMinorHighest: true,
          isPatchHighest: false,
          matches: {
            major: ['0.0.0', '0.1.1'],
            minor: ['0.1.1'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0'],
        'next'
      );

      expect(tags).toEqual(['v0.1.0~next']);
    });

    it('handles a new minor version or highest patch version when major & minor versions are not highest', () => {
      let tags = smartTagPreRelease(
        {
          version: '0.1.0-alpha',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: false,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0'],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0'],
        'next'
      );

      expect(tags).toEqual(['v0.1~next', 'v0.1.0~next']);

      tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: false,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0'],
            minor: ['0.1.0'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0.1~next', 'v0.1.1~next']);

      tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha.1',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: false,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0', '0.1.1-alpha'],
            minor: ['0.1.0', '0.1.1-alpha'],
            patch: ['0.1.1-alpha']
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0.1~next', 'v0.1.1~next']);
    });

    it('handles edge case where patch version are highest but major, minor, & pre-release versions are not', () => {
      const tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: false,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0', '0.1.1-alpha.1'],
            minor: ['0.1.0', '0.1.1-alpha.1'],
            patch: ['0.1.1-alpha.1']
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0.1.1~next']);
    });

    it('handles edge case where new patch version is not highest, along with major & minor versions not being highest', () => {
      const tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: false,
          isMinorHighest: false,
          isPatchHighest: false,
          matches: {
            major: ['0.0.0', '0.1.0', '0.1.2'],
            minor: ['0.1.0', '0.1.2'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0.1~next', 'v0.1.1~next']);
    });

    it('handles edge case where patch & pre-release versions are not highest, along with major & minor versions not being highest', () => {
      const tags = smartTagPreRelease(
        {
          version: '0.1.1-alpha',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: false,
          isMinorHighest: false,
          isPatchHighest: false,
          matches: {
            major: ['0.0.0', '0.1.0', '0.1.1-alpha.1', '0.1.2'],
            minor: ['0.1.0', '0.1.1-alpha.1', '0.1.2'],
            patch: ['0.1.1-alpha.1']
          }
        },
        ['v0', 'v0.1', 'v0.1.1'],
        'next'
      );

      expect(tags).toEqual(['v0.1.1~next']);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  /// smartTagRelease
  //////////////////////////////////////////////////////////////////////////////

  describe('smartTagRelease', () => {
    it('handles an initial release', () => {
      const tags = smartTagRelease(
        {
          version: '0.0.0',
          major: 0,
          minor: 0,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: [],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.0', 'v0.0.0']
      );

      expect(tags).toEqual(['latest', 'v0~latest', 'v0.0~latest']);
    });

    it('handles a new minor version or highest patch version when major version is highest', () => {
      let tags = smartTagRelease(
        {
          version: '0.1.0',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0'],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0']
      );

      expect(tags).toEqual(['latest', 'v0~latest', 'v0.1~latest']);

      tags = smartTagRelease(
        {
          version: '0.1.1',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: true,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0'],
            minor: ['0.1.0'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.1']
      );

      expect(tags).toEqual(['latest', 'v0~latest', 'v0.1~latest']);
    });

    it('handles edge case where patch version is lower than others when major & minor version is highest', () => {
      const tags = smartTagRelease(
        {
          version: '0.1.0',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: true,
          isPatchHighest: false,
          matches: {
            major: ['0.0.0', '0.1.1'],
            minor: ['0.1.1'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0']
      );

      expect(tags).toEqual(['v0.1.0~latest']);
    });

    it('handles new minor version or highest patch version when major version is highest but minor version is not', () => {
      let tags = smartTagRelease(
        {
          version: '0.1.0',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.2.0'],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0']
      );

      expect(tags).toEqual(['v0.1~latest']);

      tags = smartTagRelease(
        {
          version: '0.1.1',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: true,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0', '0.2.0'],
            minor: ['0.1.0'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.1']
      );

      expect(tags).toEqual(['v0.1~latest']);
    });

    it('handles edge case where patch version is lower than others when major version is highest but minor version is not', () => {
      const tags = smartTagRelease(
        {
          version: '0.1.0',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: true,
          isMinorHighest: false,
          isPatchHighest: false,
          matches: {
            major: ['0.0.0', '0.1.1', '0.2.0'],
            minor: ['0.1.1'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0']
      );

      expect(tags).toEqual(['v0.1.0~latest']);
    });

    it('handles edge case where major version is new but is not highest', () => {
      const tags = smartTagRelease(
        {
          version: '0.0.0',
          major: 0,
          minor: 0,
          patch: 0,
          isMajorHighest: false,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: [],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.0', 'v0.0.0']
      );

      expect(tags).toEqual(['v0~latest', 'v0.0~latest']);
    });

    it('handles a new minor version or highest patch version when major version is not highest but minor version is', () => {
      let tags = smartTagRelease(
        {
          version: '0.1.0',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: false,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0'],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0']
      );

      expect(tags).toEqual(['v0~latest', 'v0.1~latest']);

      tags = smartTagRelease(
        {
          version: '0.1.1',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: false,
          isMinorHighest: true,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0'],
            minor: ['0.1.0'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.1']
      );

      expect(tags).toEqual(['v0~latest', 'v0.1~latest']);
    });

    it('handles edge case where patch version is lower than others when major version is not highest but minor version is highest', () => {
      const tags = smartTagRelease(
        {
          version: '0.1.0',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: false,
          isMinorHighest: true,
          isPatchHighest: false,
          matches: {
            major: ['0.0.0', '0.1.1'],
            minor: ['0.1.1'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0']
      );

      expect(tags).toEqual(['v0.1.0~latest']);
    });

    it('handles a new minor version or highest patch version when major & minor versions are not highest', () => {
      let tags = smartTagRelease(
        {
          version: '0.1.0',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: false,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0'],
            minor: [],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0']
      );

      expect(tags).toEqual(['v0.1~latest']);

      tags = smartTagRelease(
        {
          version: '0.1.1',
          major: 0,
          minor: 1,
          patch: 1,
          isMajorHighest: false,
          isMinorHighest: false,
          isPatchHighest: true,
          matches: {
            major: ['0.0.0', '0.1.0'],
            minor: ['0.1.0'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.1']
      );

      expect(tags).toEqual(['v0.1~latest']);
    });

    it('handles edge case where version is lower than all others', () => {
      const tags = smartTagRelease(
        {
          version: '0.1.0',
          major: 0,
          minor: 1,
          patch: 0,
          isMajorHighest: false,
          isMinorHighest: false,
          isPatchHighest: false,
          matches: {
            major: ['0.0.0', '0.1.1'],
            minor: ['0.1.1'],
            patch: []
          }
        },
        ['v0', 'v0.1', 'v0.1.0']
      );

      expect(tags).toEqual(['v0.1.0~latest']);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  /// fetchPackageVersions
  //////////////////////////////////////////////////////////////////////////////

  describe('fetchPackageVersions', () => {
    it('throws error when package does not exist in NPM registry', () =>
      expect(() => fetchPackageVersions('failit-')).toThrow(/.*Fetch failed.*/));

    it('fetches versions if package exists in NPM registery', () => {
      const versions = fetchPackageVersions('semver');
      expect(Array.isArray(versions)).toEqual(true);
      expect(versions.length > 0).toEqual(true);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  /// analyzePackageVersion
  //////////////////////////////////////////////////////////////////////////////

  describe('analyzePackageVersion', () => {
    it('handles case when version is less than or equal to others', () => {
      const { version, major, minor, patch, isMajorHighest, isMinorHighest, isPatchHighest, matches } =
        analyzePackageVersion('0.0.0', ['0.0.0', '1.2.3', '4.5.6']);

      expect(version).toEqual('0.0.0');
      expect(major).toEqual(0);
      expect(minor).toEqual(0);
      expect(patch).toEqual(0);
      expect(isMajorHighest).toEqual(false);
      expect(isMinorHighest).toEqual(true);
      expect(isPatchHighest).toEqual(true);
      expect(matches.major.length === 1).toEqual(true);
      expect(matches.minor.length === 1).toEqual(true);
      expect(matches.patch.length === 1).toEqual(true);
    });

    it('handles case when major version is less than or equal to others, minor is less than all matches', () => {
      const { version, major, minor, patch, isMajorHighest, isMinorHighest, isPatchHighest, matches } =
        analyzePackageVersion('0.0.0', ['0.1.0', '1.2.3', '4.5.6']);

      expect(version).toEqual('0.0.0');
      expect(major).toEqual(0);
      expect(minor).toEqual(0);
      expect(patch).toEqual(0);
      expect(isMajorHighest).toEqual(false);
      expect(isMinorHighest).toEqual(false);
      expect(isPatchHighest).toEqual(true);
      expect(matches.major.length === 1).toEqual(true);
      expect(matches.minor.length === 0).toEqual(true);
      expect(matches.patch.length === 0).toEqual(true);
    });

    it('handles case when major & minor version is less than or equal to others, patch is less than all matches', () => {
      const { version, major, minor, patch, isMajorHighest, isMinorHighest, isPatchHighest, matches } =
        analyzePackageVersion('0.1.0', ['0.1.1', '1.2.3', '4.5.6']);

      expect(version).toEqual('0.1.0');
      expect(major).toEqual(0);
      expect(minor).toEqual(1);
      expect(patch).toEqual(0);
      expect(isMajorHighest).toEqual(false);
      expect(isMinorHighest).toEqual(true);
      expect(isPatchHighest).toEqual(false);
      expect(matches.major.length === 1).toEqual(true);
      expect(matches.minor.length === 1).toEqual(true);
      expect(matches.patch.length === 0).toEqual(true);
    });
  });
});
