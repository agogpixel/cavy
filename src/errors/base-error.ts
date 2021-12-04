import { PrettyPrintableError } from '@oclif/errors';

export abstract class BaseError extends Error implements PrettyPrintableError {
  abstract readonly name: string;
  abstract readonly code?: string;
  abstract readonly suggestions?: string[];
  abstract readonly ref?: string;
}
