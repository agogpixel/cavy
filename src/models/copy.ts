import { CommandConfig, CommandsConfig, ParsedCommands } from './command';

export interface CopyCommandConfig extends CommandConfig {
  src: string;
  dst: string;
  redact: string[];
}

export type CopyConfig = CommandsConfig<CopyCommandConfig>;

export type ParsedCopyCommands = ParsedCommands<CopyCommandConfig>;
