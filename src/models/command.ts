export interface CommandConfig {
  name: string;
}

export interface CommandsConfig<T extends CommandConfig = CommandConfig> {
  commands: T[];
}

export interface ParsedCommands<T extends CommandConfig = CommandConfig> {
  names: string[];
  commands: Record<string, T>;
}
