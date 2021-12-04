import { CommandConfig, CommandsConfig, ParsedCommands } from './command';

export interface CleanCommandConfig extends CommandConfig {
  dirs: string[];
  files: string[];
}

export type CleanConfig = CommandsConfig<CleanCommandConfig>;

export type ParsedCleanCommands = ParsedCommands<CleanCommandConfig>;
