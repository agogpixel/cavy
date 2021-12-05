import { flags } from '@oclif/command';
import { resolve as resolvePath } from 'path';
import { exec, mv } from 'shelljs';
import { JsonObject, PackageJson } from 'type-fest';

import Command from '../command';
import { PackCommandConfig, ParsedPackCommands } from '../models';
import { packConfigSchema } from '../schemas';
import { readCache, readJsonFile, validateSrcDstDirs, writeCache, writeJsonFile } from '../utils';

export default class Pack extends Command<PackCommandConfig, ParsedPackCommands> {
  /**
   *
   */
  static description = 'create package tarball';

  /**
   *
   */
  static examples = [`$ cavy pack --all`, `$ cavy pack myCavyPackCommandName --quiet`];

  /**
   *
   */
  static flags = {
    ...Command.flags,

    /**
     *
     */
    release: flags.boolean({
      char: 'r',
      description: 'do not append devPostfix value to version property in package.json'
    })
  };

  /**
   *
   */
  static args = [...Command.args];

  /**
   *
   */
  static strict = false;

  protected readonly name = 'pack';

  protected readonly schema = packConfigSchema;

  async run() {
    this.log('\nCavy Pack\n');

    const {
      argv,
      flags: { all, release }
    } = this.parse(Pack);

    const parsed = this.parsedCommands;
    const commands = parsed.commands;
    const names = all ? parsed.names : argv;

    const timestamp = (Date.now() / 1000) | 0;

    let isError = false;

    names.forEach((name) => {
      try {
        this.executeCommand(commands[name], release, timestamp);
      } catch (e) {
        isError = true;
        this.error(e as Error, { exit: false });
      }
    });

    if (isError) {
      this.log();
      this.error('Pack had failure(s)');
    }

    this.log();
    this.log('Pack successful');
  }

  private executeCommand(command: PackCommandConfig, release: boolean, timestamp: number) {
    const { name, src, dst, devPostfix, postUpdate } = command;

    this.log(`\n${name}: ${release ? 'release' : 'dev'}\n`);

    const { src: srcDirResolved, dst: dstDirResolved } = validateSrcDstDirs(src, dst);

    if (!release) {
      const targetPackageJsonPath = resolvePath(`${srcDirResolved}/package.json`);
      const targetPackageJson: PackageJson = readJsonFile<JsonObject>(targetPackageJsonPath);

      if (!targetPackageJson.version?.includes(`--${devPostfix}-`)) {
        targetPackageJson.version += `--${devPostfix}-${timestamp}`;

        writeJsonFile(targetPackageJson, targetPackageJsonPath);
      }
    }

    const silent = this.isQuiet;

    postUpdate.forEach((cmd) => {
      if (exec(`cd ${srcDirResolved} && ${cmd}`, { silent }).code !== 0) {
        throw new Error(`Post-update command failed: ${cmd}`);
      }
    });

    const packResult = exec(`cd ${srcDirResolved} && npm pack`, { silent });

    if (packResult.code !== 0) {
      throw new Error(`Pack failed: ${srcDirResolved}`);
    }

    const tarballName = packResult.stdout.trim();
    const tarballPath = resolvePath(`${srcDirResolved}/${tarballName}`);

    if (mv(tarballPath, dstDirResolved).code !== 0) {
      throw new Error(`Package tarball move to destination directory failed: ${dstDirResolved}`);
    }

    const cache = readCache(this.configPath);

    if (!cache.tarballs[name]) {
      cache.tarballs[name] = [tarballName];
    } else {
      cache.tarballs[name].unshift(tarballName);
    }

    writeCache(this.configPath, cache);
  }
}
