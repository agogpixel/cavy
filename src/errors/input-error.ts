import { BaseError } from './base-error';

export class InputError extends BaseError {
  readonly name = 'Input Error';
  readonly code = undefined;
  readonly suggestions = ['See more help with --help'];
  readonly ref = undefined;
}
