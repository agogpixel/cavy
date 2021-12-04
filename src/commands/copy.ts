import { flags } from '@oclif/command';
import { delete as deleteProp } from 'dot-prop';
import { resolve as resolvePath } from 'path';
import { JsonObject, PackageJson } from 'type-fest';

import Command from '../command';
import { CopyCommandConfig, ParsedCopyCommands } from '../models';
import { copyConfigSchema } from '../schemas';
import { readJsonFile, validateSrcDstDirs, writeJsonFile } from '../utils';

export default class Copy extends Command<CopyCommandConfig, ParsedCopyCommands> {
  /**
   *
   */
  static description = 'copy package.json from src directory to dst directory, with redactions';

  /**
   *
   */
  static examples = [`$ cavy copy --all`, `$ cavy copy --all --force`, `$ cavy copy myCavyCopyCommandName --quiet`];

  /**
   *
   */
  static flags = {
    ...Command.flags,

    /**
     *
     */
    force: flags.boolean({
      char: 'f',
      description: 'execute copy commands even if src & dst directories are the same'
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

  protected readonly name = 'copy';

  protected readonly schema = copyConfigSchema;

  async run() {
    this.log('\nCavy Copy\n');

    const {
      argv,
      flags: { all, force }
    } = this.parse(Copy);

    const parsed = this.parsedCommands;
    const commands = parsed.commands;
    const names = all ? parsed.names : argv;

    let isError = false;

    names.forEach((name) => {
      try {
        this.executeCommand(commands[name], force);
      } catch (e) {
        isError = true;
        this.error(e as Error, { exit: false });
      }
    });

    if (isError) {
      this.log();
      this.error('Copy had failure(s)');
    }

    this.log();
    this.log('Copy successful');
  }

  private executeCommand(command: CopyCommandConfig, force: boolean) {
    const { name, src, dst, redact } = command;

    this.log(`\n${name}: ${force ? 'force' : 'no-force'}\n`);

    const { src: srcDirResolved, dst: dstDirResolved } = validateSrcDstDirs(src, dst);

    if (srcDirResolved === dstDirResolved) {
      if (force) {
        this.warn(`Source and destination directories same: ${srcDirResolved}`);
      } else {
        throw new Error(
          `Source and destination directories same: ${srcDirResolved}\nUse --force to force this operation`
        );
      }
    }

    const srcPackageJsonPath = resolvePath(`${srcDirResolved}/package.json`);
    const dstPackageJsonPath = resolvePath(`${dstDirResolved}/package.json`);

    const packageJson: PackageJson = readJsonFile<JsonObject>(srcPackageJsonPath);

    this.log(`Copying ${srcPackageJsonPath} to ${dstPackageJsonPath}`);
    this.log(`Redacting: ${redact.join(', ')}\n`);

    redact.forEach((path) => deleteProp(packageJson, path));

    writeJsonFile(packageJson, dstPackageJsonPath);
  }
}
