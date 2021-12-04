import { Command as BaseCommand, flags } from '@oclif/command';
import { PrettyPrintableError } from '@oclif/errors';
import Joi from 'joi';
import { resolve as resolvePath } from 'path';
import { JsonObject } from 'type-fest';

import { ConfigError, InputError } from './errors';
import { CommandConfig, CommandsConfig, Config, ParsedCommands } from './models';
import { partialConfigSchema } from './schemas';
import { readJsonFile } from './utils';

/**
 * Base command from which all other commands extend.
 */
export default abstract class Command<
  T extends CommandConfig = CommandConfig,
  U extends ParsedCommands<T> = ParsedCommands<T>
> extends BaseCommand {
  /**
   * Flags common to all commands.
   */
  static flags = {
    /**
     *
     */
    all: flags.boolean({
      char: 'a',
      description:
        'execute all commands in the order they are specified in cavy config file; required if no commands provided'
    }),

    /**
     * Path to configuration file.
     */
    config: flags.string({ char: 'c', default: '.cavy', description: 'path to cavy config file' }),

    /**
     * Print help.
     */
    help: flags.help({ char: 'h' }),

    /**
     * Suppress output.
     */
    quiet: flags.boolean({ char: 'q', exclusive: ['verbose'], description: 'suppress output' }),

    /**
     * Verbose output.
     */
    verbose: flags.boolean({ char: 'v', exclusive: ['quiet'], description: 'verbose output' })
  };

  /**
   *
   */
  static args = [
    {
      name: '...',
      required: false,
      description:
        'commands to execute (from cavy config file); executed in order provided on cli; mutually exclusive with --all'
    }
  ];

  /**
   *
   */
  static strict = false;

  /**
   *
   */
  protected abstract readonly name: keyof Config;

  /**
   *
   */
  protected abstract readonly schema: Joi.ObjectSchema<CommandsConfig<T>>;

  /**
   * Cavy configuration loaded during command init.
   */
  protected cavyConfig!: Config;

  /**
   *
   */
  protected parsedCommands: U = {
    names: [],
    commands: {}
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } as any;

  /**
   *
   */
  protected isAll!: boolean;

  /**
   *
   */
  protected isQuiet!: boolean;

  /**
   *
   */
  protected isVerbose!: boolean;

  /**
   *
   */
  protected configPath!: string;

  /**
   * Initialize command.
   */
  async init() {
    const {
      argv,
      flags: { all, config: configPath, quiet, verbose }
    } = this.parse(this.constructor as typeof Command);

    this.isAll = all;
    this.isQuiet = quiet;
    this.isVerbose = verbose;
    this.configPath = resolvePath(configPath);

    try {
      this.loadCavyConfig(this.configPath);
    } catch (e) {
      quiet ? this.exit(1) : this.error(e as Error);
    }

    try {
      this.parseCommand();
      this.validateInput(argv);
    } catch (e) {
      this.error(e as Error);
    }

    this.logCommandSummary(argv);
  }

  error: (
    input: string | Error,
    options?: {
      code?: string;
      exit?: number | false;
    } & PrettyPrintableError
  ) => void & never = ((
    input: string | Error,
    options?: {
      code?: string;
      exit?: number | false;
    } & PrettyPrintableError
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.isQuiet ? this.exit(1) : super.error(input, options as any);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

  log(message?: string, ...args: unknown[]) {
    if (!this.isQuiet) {
      super.log(message, ...args);
    }
  }

  verbose(message?: string, ...args: unknown[]) {
    if (this.isVerbose) {
      super.log(message, ...args);
    }
  }

  warn(input: string | Error) {
    if (!this.isQuiet) {
      super.warn(input);
    }
  }

  protected logCommandSummary(argv: string[]) {
    const availableCommands = this.parsedCommands.names.map((name) => name).join(', ');

    this.verbose(`\nAvailable commands: ${availableCommands}`);
    this.verbose(`Specified commands: ${this.isAll ? availableCommands : argv.join(', ')}`);
  }

  protected parseCommand() {
    const name = this.name;

    const config = this.cavyConfig[name] as CommandsConfig;

    if (config === undefined) {
      throw new ConfigError(`Cavy ${name} config required`);
    }

    const { error } = this.schema.validate(config);

    if (error) {
      throw new ConfigError(`Invalid cavy ${name} config: ${error}`);
    }

    const parsed = this.parsedCommands;

    config.commands.forEach((command) => {
      const name = command.name;

      parsed.names.push(name);
      parsed.commands[name] = command as T;
    });
  }

  /**
   *
   * @param argv
   * @param all
   * @throws InputError
   */
  protected validateInput(argv: string[]) {
    const name = this.name;
    const all = this.isAll;

    if (!all && !argv.length) {
      throw new InputError(`No ${name} commands were specified: --all required`);
    } else if (all && argv.length) {
      throw new InputError(`Commands were specified for ${name}: --all invalid`);
    }

    const commands = this.parsedCommands.commands;
    const badCommands: string[] = [];

    argv.forEach((command) => (!commands[command] ? badCommands.push(command) : undefined));

    if (badCommands.length) {
      throw new InputError(`Commands not found in cavy ${name} config: ${badCommands.join(', ')}`);
    }
  }

  /**
   * Load command configuration from file.
   *
   * @param configPath Path to configuration file.
   * @throws ConfigError
   */
  private loadCavyConfig(configPath: string) {
    try {
      this.cavyConfig = readJsonFile<Config & JsonObject>(configPath);
    } catch (e) {
      throw new ConfigError(`Failed loading cavy config file: ${configPath}\n${(e as Error).message}`);
    }

    this.debug('Cavy Config', JSON.stringify(this.cavyConfig, undefined, 2));

    const { error } = partialConfigSchema.validate(this.cavyConfig);

    if (error) {
      throw new ConfigError(`Invalid cavy config file contents: ${error}`);
    }
  }
}
