import Joi from 'joi';

import { CleanCommandConfig, CleanConfig } from '../models';

import { commandConfigSchema } from './command';

const cleanCommandConfigSchema = commandConfigSchema.append<CleanCommandConfig>({
  dirs: Joi.array().items(Joi.string()).required(),
  files: Joi.array().items(Joi.string()).required()
});

export const cleanConfigSchema = Joi.object<CleanConfig, true>({
  commands: Joi.array().items(cleanCommandConfigSchema.required()).required()
});
