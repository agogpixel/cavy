import { CommandConfig, CommandsConfig, ParsedCommands } from './command';

export interface LintCommandConfig extends CommandConfig {
  targets: string[];
  test: string;
  fix: string;
}

export type LintConfig = CommandsConfig<LintCommandConfig>;

export type ParsedLintCommands = ParsedCommands<LintCommandConfig>;
