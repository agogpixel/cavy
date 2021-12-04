import { resolve as resolvePath } from 'path';
import { exec } from 'shelljs';

import Command from '../command';
import { PublishCommandConfig, ParsedPublishCommands } from '../models';
import { publishConfigSchema } from '../schemas';
import { extractPackageJson, readCache, smartTag, writeCache } from '../utils';

export default class Publish extends Command<PublishCommandConfig, ParsedPublishCommands> {
  /**
   *
   */
  static description = 'publish package tarball';

  /**
   *
   */
  static examples = [`$ cavy publish --all`, `$ cavy pack myCavyPublishCommandName --quiet`];

  /**
   *
   */
  static flags = {
    ...Command.flags
  };

  /**
   *
   */
  static args = [...Command.args];

  /**
   *
   */
  static strict = false;

  protected readonly name = 'publish';

  protected readonly schema = publishConfigSchema;

  async run() {
    this.log('\nCavy Publish\n');

    const getRegistryUrlResult = exec('npm config get registry', { silent: this.isQuiet });

    if (getRegistryUrlResult.code !== 0) {
      throw new Error('Error fetching registry url');
    }

    const registryUrl = getRegistryUrlResult.stdout.trim();

    if (!registryUrl) {
      throw new Error('Registry url not set');
    }

    this.log(`registry: ${registryUrl}\n`);

    const {
      argv,
      flags: { all }
    } = this.parse(Publish);

    const parsed = this.parsedCommands;
    const commands = parsed.commands;
    const names = all ? parsed.names : argv;

    let isError = false;

    names.forEach(async (name) => {
      try {
        await this.executeCommand(commands[name]);
      } catch (e) {
        isError = true;
        this.error(e as Error, { exit: false });
      }
    });

    if (isError) {
      this.log();
      this.error('Publish had failure(s)');
    }

    this.log();
    this.log('Publish successful');
  }

  private async executeCommand(command: PublishCommandConfig) {
    const { name, packName, preReleaseTag } = command;

    this.log(`\n${name}: ${packName}\n`);

    const cache = readCache(this.configPath);

    if (!Array.isArray(cache.tarballs[packName]) || !cache.tarballs[packName].length) {
      throw new Error(`Invalid tarball cache: ${packName}`);
    }

    const packCommand = this.cavyConfig.pack.commands.find((cmd) => cmd.name === packName);

    if (!packCommand) {
      throw new Error(`Pack name not found: ${packName}`);
    }

    const { devPostfix, dst } = packCommand;

    const dstDirResolved = resolvePath(dst);
    const tarballPath = resolvePath(`${dstDirResolved}/${cache.tarballs[packName][0]}`);

    const { name: packageName, version: packageVersion } = await extractPackageJson(tarballPath);

    if (!packageName) {
      throw new Error('Package name not set');
    } else if (!packageVersion) {
      throw new Error('Package version not set');
    }

    let tags: string[];

    if (!cache.tags[name]) {
      cache.tags[name] = {};
    }

    if (Array.isArray(cache.tags[name][packageVersion]) && cache.tags[name][packageVersion].length > 0) {
      tags = cache.tags[name][packageVersion];
    } else {
      tags = cache.tags[name][packageVersion] = smartTag(packageName, packageVersion, preReleaseTag, devPostfix);
      writeCache(this.configPath, cache);
    }

    const silent = this.isQuiet;

    const publishResult = exec(`npm publish ${tarballPath} --tag ${tags[0]} --access public`, { silent });

    if (publishResult.code !== 0) {
      throw new Error(`Publish failed: ${tarballPath}`);
    }

    const packageNameWithVersion = `${packageName}@${packageVersion}`;

    for (let i = 1; i < tags.length; ++i) {
      const tag = tags[i];
      exec(`npm dist-tag add ${packageNameWithVersion} ${tag}`, {
        silent
      });
    }
  }
}
