import { CommandConfig, CommandsConfig, ParsedCommands } from './command';

export interface PublishCommandConfig extends CommandConfig {
  packName: string;
  preReleaseTag: string;
}

export type PublishConfig = CommandsConfig<PublishCommandConfig>;

export type ParsedPublishCommands = ParsedCommands<PublishCommandConfig>;
