import { parse as parseJsonWithComments } from 'comment-json';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve as resolvePath } from 'path';
import { test as testPath } from 'shelljs';
import { JsonObject, JsonValue, PackageJson } from 'type-fest';
import { readEntry } from 'untar-to-memory';

import { Cache } from '../models';
import { cacheSchema } from '../schemas';

export const defaultCacheFilePath = '.cavycache';

export async function extractPackageJson(path: string) {
  return new Promise<PackageJson>((resolve, reject) => {
    readEntry(path, 'package/package.json', {}, (error, buffer) => {
      if (error) {
        reject(error.message);
        return;
      }

      resolve(parseJsonWithComments(buffer.toString('utf-8')));
    });
  });
}

export function readCache(configPath: string, cacheFilePath = defaultCacheFilePath) {
  const defaultCacheSlice: Cache = { tarballs: {}, tags: {} };

  if (!existsSync(cacheFilePath)) {
    return defaultCacheSlice;
  }

  const cache = readJsonFile<JsonObject>(cacheFilePath);

  const { error } = cacheSchema.validate(cache);

  if (error) {
    throw new Error(`Invalid cache file contents: ${error}`);
  }

  const cacheSlice = cache[configPath] as unknown as Cache;

  return cacheSlice ? cacheSlice : defaultCacheSlice;
}

export function readFile(path: string) {
  if (!existsSync(path)) {
    throw new Error('File not found');
  }

  return readFileSync(path, { encoding: 'utf-8' });
}

export function readJsonFile<T extends JsonValue = JsonValue>(path: string): T {
  return parseJsonWithComments(readFile(path), undefined, true);
}

export function validateSrcDstDirs(src: string, dst: string) {
  const resolvedSrc = resolvePath(src);
  const resolvedDst = resolvePath(dst);

  if (!testPath('-d', resolvedSrc)) {
    throw new Error(`Source not a directory: ${resolvedSrc}`);
  }

  if (!testPath('-d', resolvedDst)) {
    throw new Error(`Destination not a directory: ${resolvedDst}`);
  }

  return { src: resolvedSrc, dst: resolvedDst };
}

export function writeCache(configPath: string, cache: Cache, cacheFilePath = defaultCacheFilePath) {
  let targetCache: JsonObject;

  if (!existsSync(cacheFilePath)) {
    targetCache = {};
  } else {
    targetCache = readJsonFile<JsonObject>(cacheFilePath);
  }

  targetCache[configPath] = cache as Cache & JsonObject;

  const { error } = cacheSchema.validate(targetCache);

  if (error) {
    throw new Error(`Invalid cache file contents: ${error}`);
  }

  writeJsonFile(targetCache, cacheFilePath);
}

export function writeFile(content: string, path: string) {
  writeFileSync(path, content, { encoding: 'utf-8' });
}

export function writeJsonFile(content: JsonValue | PackageJson, path: string) {
  writeFile(JSON.stringify(content, undefined, 2), path);
}
