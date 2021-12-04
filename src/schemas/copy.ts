import Joi from 'joi';

import { CopyCommandConfig, CopyConfig } from '../models';

import { commandConfigSchema } from './command';

const copyCommandConfigSchema = commandConfigSchema.append<CopyCommandConfig>({
  src: Joi.string().required(),
  dst: Joi.string().required(),
  redact: Joi.array().items(Joi.string()).required()
});

export const copyConfigSchema = Joi.object<CopyConfig, true>({
  commands: Joi.array().items(copyCommandConfigSchema.required()).required()
});
