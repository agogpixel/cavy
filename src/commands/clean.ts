import { flags } from '@oclif/command';
import { rm } from 'shelljs';

import Command from '../command';
import { CleanCommandConfig, ParsedCleanCommands } from '../models';
import { cleanConfigSchema } from '../schemas';

/**
 * Wraps multiple clean commands with no-force semantics.
 */
export default class Clean extends Command<CleanCommandConfig, ParsedCleanCommands> {
  /**
   *
   */
  static description = 'run clean commands';

  /**
   *
   */
  static examples = [
    `$ cavy clean --all`,
    `$ cavy clean --all --no-force`,
    `$ cavy clean myCavyCleanCommandName --quiet`
  ];

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
      default: true,
      allowNo: true,
      description: "[default: true] execute clean commands using 'force'"
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

  protected readonly name = 'clean';

  protected readonly schema = cleanConfigSchema;

  async run() {
    this.log('\nCavy Clean\n');

    const {
      argv,
      flags: { all, force }
    } = this.parse(Clean);

    const parsed = this.parsedCommands;
    const commands = parsed.commands;
    const names = all ? parsed.names : argv;

    const dirsArgs = [`-r${force ? 'f' : ''}`];
    const filesArgs = force ? ['-f'] : [];

    let isError = false;

    names.forEach((name) => {
      const { dirs, files } = commands[name];

      this.log(`\n${name}: ${force ? 'force' : 'no-force'}`);

      if (dirs.length) {
        this.log(`Directories: ${dirs.join(' ')}`);

        try {
          this.removeTargets(dirs, dirsArgs);
        } catch (e) {
          isError = true;
          this.error(e as Error, { exit: false });
        }
      } else {
        this.log('Directories: skipping!');
      }

      if (files.length) {
        this.log(`Files: ${files.join(' ')}`);

        try {
          this.removeTargets(files, filesArgs);
        } catch (e) {
          isError = true;
          this.error(e as Error, { exit: false });
        }
      } else {
        this.log('Files: skipping!');
      }
    });

    if (isError) {
      this.log();
      this.error('Clean had failure(s)');
    }

    this.log();
    this.log('Clean successful');
  }

  private removeTargets(targets: string[], options: string[]) {
    const result = rm(...options.concat(targets));

    if (result.code !== 0) {
      throw new Error(result.stderr);
    }
  }
}
