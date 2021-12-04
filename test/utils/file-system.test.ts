// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../typings.d.ts" />

import { existsSync } from 'fs';
import { mkdir, rm, ShellString } from 'shelljs';

import {
  defaultCacheFilePath,
  extractPackageJson,
  readCache,
  readFile,
  readJsonFile,
  validateSrcDstDirs,
  writeCache,
  writeFile,
  writeJsonFile
} from '../../src/utils/file-system';

const testResourcesPath = `${TEST_RESOURCES_PATH}/utils/file-system`;
const testTmpPath = `${TEST_TMP_PATH}/utils/file-system`;

const textFile = `${testResourcesPath}/test-file.txt`;

const invalidTarball = `${testResourcesPath}/extract-package-json-invalid.tgz`;
const validTarball = `${testResourcesPath}/extract-package-json-valid.tgz`;

const invalidJsonCache = `${testResourcesPath}/invalid-json-cache-file.json`;
const invalidSchemaCache = `${testResourcesPath}/invalid-schema-cache-file.json`;
const validCache = `${testResourcesPath}/valid-cache-file.json`;

const invalidJson = `${testResourcesPath}/invalid-json-file.json`;
const validJson = `${testResourcesPath}/valid-json-file.json`;

describe('file-system', () => {
  // Squelch console output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  //////////////////////////////////////////////////////////////////////////////
  /// extractPackageJson
  //////////////////////////////////////////////////////////////////////////////

  describe('extractPackageJson', () => {
    it('throws error when path does not exist', async () =>
      await expect(async () => await extractPackageJson('failit')).rejects.toEqual('tar archive not found: failit'));

    it('throws error when path is not a tar archive', async () =>
      await expect(async () => await extractPackageJson(textFile)).rejects.toEqual(`Not a tarball: ${textFile}`));

    it('throws error when path is not a valid npm package tarball', async () =>
      await expect(async () => await extractPackageJson(invalidTarball)).rejects.toEqual(
        `package/package.json not found in archive ${invalidTarball}`
      ));

    it('extracts from a valid npm package tarball', async () => {
      const packageJson = await extractPackageJson(validTarball);

      expect(packageJson).toBeDefined();
      expect(packageJson.name).toBeTruthy();
      expect(packageJson.version).toBeTruthy();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  /// readCache
  //////////////////////////////////////////////////////////////////////////////

  describe('readCache', () => {
    it('returns default cache slice when cache file not found', () => {
      const cache = readCache('someconfigpath', 'nocachefile');
      expect(cache).toBeDefined();
      expect(cache.tags).toBeDefined();
      expect(cache.tarballs).toBeDefined();
    });

    it('throws error when cache file is invalid json', () =>
      expect(() => readCache('someconfigpath', invalidJsonCache)).toThrow(/.*Unexpected token.*/));

    it('throws error when cache file has an invalid json schema', () =>
      expect(() => readCache('someconfigpath', invalidSchemaCache)).toThrow(/.*Invalid cache file contents.*/));

    it('reads from a valid cache file', () => {
      const slugs = ['testA', 'testB'];

      const cache = readCache('test', validCache);

      expect(cache.tags.test.test).toEqual(slugs);
      expect(cache.tarballs.test).toEqual(slugs);
    });

    it('returns a cache slice when default cache file path is used', () => {
      let tmpDefaultCache = false;

      if (!existsSync(defaultCacheFilePath)) {
        tmpDefaultCache = true;
        new ShellString(`{
          "test": {
            "tags": {
              "test": {
                "test": ["testA", "testB"]
              }
            },
            "tarballs": {
                "test": ["testA", "testB"]
            }
          }
        }`).to(defaultCacheFilePath);
      }

      const cache = readCache('someconfigpath');

      if (tmpDefaultCache) {
        rm('-f', defaultCacheFilePath);
      }

      expect(cache).toBeDefined();
      expect(cache.tags).toBeDefined();
      expect(cache.tarballs).toBeDefined();
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  /// readFile
  //////////////////////////////////////////////////////////////////////////////

  describe('readFile', () => {
    it('throws error when path does not exist', () => expect(() => readFile('failit')).toThrow('File not found'));
    it('reads a valid file', () => expect(readFile(textFile)).toBeTruthy());
  });

  //////////////////////////////////////////////////////////////////////////////
  /// readJsonFile
  //////////////////////////////////////////////////////////////////////////////

  describe('readJsonFile', () => {
    it('throws error when path does not exist', () => expect(() => readJsonFile('failit')).toThrow('File not found'));

    it('throws error when JSON file is invalid', () =>
      expect(() => readJsonFile(invalidJson)).toThrow(/.*Unexpected token.*/));

    it('reads a valid JSON file', () => {
      const parsedJson = readJsonFile<{ test: string }>(validJson);
      expect(parsedJson).toBeDefined();
      expect(parsedJson.test).toEqual('Hello world!');
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  /// validateSrcDstDirs
  //////////////////////////////////////////////////////////////////////////////

  describe('validateSrcDstDirs', () => {
    it('throws error when source is not a directory', () =>
      expect(() => validateSrcDstDirs(`${testResourcesPath}/failit`, `${testResourcesPath}/failit`)).toThrow(
        /.*Source not a directory.*/
      ));

    it('throws error when destination is not a directory', () =>
      expect(() => validateSrcDstDirs(testResourcesPath, `${testResourcesPath}/failit`)).toThrow(
        /.*Destination not a directory.*/
      ));

    it('returns resolved source & destination directories', () => {
      const { src, dst } = validateSrcDstDirs(testResourcesPath, testResourcesPath);
      expect(src.length > 0).toEqual(true);
      expect(dst.length > 0).toEqual(true);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  /// writeCache
  //////////////////////////////////////////////////////////////////////////////

  describe('writeCache', () => {
    const writeCacheTestTmpPath = `${testTmpPath}/writeCache`;

    beforeEach(() => mkdir('-p', writeCacheTestTmpPath));

    afterAll(() => rm('-rf', writeCacheTestTmpPath));

    it('writes to new cache file if one does not exist', () => {
      const configPath = 'someconfigpath';
      const tmpCachePath = `${writeCacheTestTmpPath}/tmptestcache`;
      const slugs = ['testA', 'testB'];

      writeCache(
        configPath,
        {
          tags: {
            test: {
              test: slugs
            }
          },
          tarballs: {
            test: slugs
          }
        },
        tmpCachePath
      );

      expect(existsSync(tmpCachePath)).toEqual(true);

      const cache = readCache(configPath, tmpCachePath);
      expect(cache.tags.test.test).toEqual(slugs);
      expect(cache.tarballs.test).toEqual(slugs);
    });

    it('writes to existing cache file', () => {
      const tmpCachePath = `${writeCacheTestTmpPath}/tmptestcache2`;
      const configPath = 'someconfigpath';
      const slugs = ['testA', 'testB'];

      new ShellString(`{
        "test": {
          "tags": {
            "test": {
              "test": ["testA", "testB"]
            }
          },
          "tarballs": {
              "test": ["testA", "testB"]
          }
        }
      }`).to(tmpCachePath);

      writeCache(
        configPath,
        {
          tags: {
            test: {
              test: slugs
            }
          },
          tarballs: {
            test: slugs
          }
        },
        tmpCachePath
      );

      expect(existsSync(tmpCachePath)).toEqual(true);

      const cache = readCache(configPath, tmpCachePath);
      expect(cache.tags.test.test).toEqual(slugs);
      expect(cache.tarballs.test).toEqual(slugs);
    });

    it('throws error if data is invalid', () => {
      const tmpCachePath = `${writeCacheTestTmpPath}/tmptestcache3`;
      const configPath = 'someconfigpath';
      const slugs = ['testA', 'testB'];

      new ShellString(`{
        "test": {
          "tags": {
            "test": {
              "test": ["testA", "testB"]
            }
          },
          "tarballs": {
              "test": ["testA", "testB"]
          }
        }
      }`).to(tmpCachePath);

      expect(() =>
        writeCache(
          configPath,
          {
            tagz: {
              test: {
                test: slugs
              }
            },
            tarballz: {
              test: slugs
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
          } as any,
          tmpCachePath
        )
      ).toThrow(/.*Invalid cache file contents.*/);
    });

    it('writes to the default cache file', () => {
      const configPath = 'someconfigpath';
      const slugs = ['testA', 'testB'];

      let tmpDefaultCache = false;
      let liveCacheBackup: string | undefined;

      if (!existsSync(defaultCacheFilePath)) {
        tmpDefaultCache = true;
        new ShellString(`{
          "test": {
            "tags": {
              "test": {
                "test": ["testA", "testB"]
              }
            },
            "tarballs": {
                "test": ["testA", "testB"]
            }
          }
        }`).to(defaultCacheFilePath);
      } else {
        liveCacheBackup = readFile(defaultCacheFilePath);
      }

      writeCache(configPath, {
        tags: {
          test: {
            test: slugs
          }
        },
        tarballs: {
          test: slugs
        }
      });

      const cache = readCache(configPath);

      if (tmpDefaultCache) {
        rm('-f', defaultCacheFilePath);
      } else {
        new ShellString(liveCacheBackup as string).to(defaultCacheFilePath);
      }

      expect(cache.tags.test.test).toEqual(slugs);
      expect(cache.tarballs.test).toEqual(slugs);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  /// writeFile
  //////////////////////////////////////////////////////////////////////////////

  describe('writeFile', () => {
    const writeFileTestTmpPath = `${testTmpPath}/writeFile`;

    beforeEach(() => mkdir('-p', writeFileTestTmpPath));

    afterAll(() => rm('-rf', writeFileTestTmpPath));

    it('writes to a file', () => {
      const path = `${writeFileTestTmpPath}/tmp-file.txt`;
      const text = 'Hello world!';

      writeFile(text, path);

      expect(existsSync(path)).toEqual(true);
      expect(readFile(path)).toContain(text);
    });
  });

  //////////////////////////////////////////////////////////////////////////////
  /// writeJsonFile
  //////////////////////////////////////////////////////////////////////////////

  describe('writeJsonFile', () => {
    const writeJsonFileTestTmpPath = `${testTmpPath}/writeJsonFile`;

    beforeEach(() => mkdir('-p', writeJsonFileTestTmpPath));

    afterAll(() => rm('-rf', writeJsonFileTestTmpPath));

    it('writes a valid JSON file', () => {
      const path = `${writeJsonFileTestTmpPath}/tmp-file.json`;
      const text = 'Hello world!';
      const content = { test: text };

      writeJsonFile(content, path);

      expect(existsSync(path)).toEqual(true);

      const parsed = readJsonFile<{ test: string }>(path);

      expect(parsed.test).toContain(text);
    });
  });
});
