import { flags } from '@oclif/command';
import { exec } from 'shelljs';

import Command from '../command';
import { LintCommandConfig, ParsedLintCommands } from '../models';
import { lintConfigSchema } from '../schemas';

/**
 * Wraps multiple lint commands with test & fix semantics.
 */
export default class Lint extends Command<LintCommandConfig, ParsedLintCommands> {
  /**
   *
   */
  static description = 'run lint commands';

  /**
   *
   */
  static examples = [`$ cavy lint --all`, `$ cavy lint --all --fix`, `$ cavy lint myCavyLintCommandName --quiet`];

  /**
   *
   */
  static flags = {
    ...Command.flags,

    /**
     *
     */
    fix: flags.boolean({ char: 'x', description: "execute lint commands using 'fix' definitions" })
  };

  /**
   *
   */
  static args = [...Command.args];

  /**
   *
   */
  static strict = false;

  protected readonly name = 'lint';

  protected readonly schema = lintConfigSchema;

  /**
   *
   */
  async run() {
    this.log('\nCavy Lint\n');

    const {
      argv,
      flags: { all, fix, quiet }
    } = this.parse(Lint);

    const parsed = this.parsedCommands;
    const commands = parsed.commands;
    const names = all ? parsed.names : argv;

    let isError = false;

    names.forEach((name) => {
      const { fix: fixCmd, test, targets } = commands[name];
      const commandString = `${fix ? fixCmd : test} ${targets.join(' ')}`;

      this.log(`\n${name}: ${commandString}\n`);

      if (exec(`${commandString}`, { silent: quiet }).code !== 0) {
        isError = true;
      }
    });

    if (isError) {
      this.log();
      this.error('Lint had failure(s)');
    }

    this.log();
    this.log('Lint successful');
  }
}
