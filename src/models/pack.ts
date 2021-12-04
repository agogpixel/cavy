import { CommandConfig, CommandsConfig, ParsedCommands } from './command';

export interface PackCommandConfig extends CommandConfig {
  src: string;
  dst: string;
  devPostfix: string;
  postUpdate: string[];
}

export type PackConfig = CommandsConfig<PackCommandConfig>;

export type ParsedPackCommands = ParsedCommands<PackCommandConfig>;
