import Joi from 'joi';

import { LintCommandConfig, LintConfig } from '../models';

import { commandConfigSchema } from './command';

const lintCommandConfigSchema = commandConfigSchema.append<LintCommandConfig>({
  targets: Joi.array().items(Joi.string()).required(),
  test: Joi.string().required(),
  fix: Joi.string().required()
});

export const lintConfigSchema = Joi.object<LintConfig, true>({
  commands: Joi.array().items(lintCommandConfigSchema.required()).required()
});
