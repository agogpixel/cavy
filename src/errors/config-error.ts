import { BaseError } from './base-error';

export class ConfigError extends BaseError {
  readonly name = 'Config Error';
  readonly code = undefined;
  readonly suggestions = undefined;
  readonly ref = undefined;
}
