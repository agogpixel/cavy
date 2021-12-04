import Joi from 'joi';

import { PackCommandConfig, PackConfig } from '../models';

import { commandConfigSchema } from './command';

const packCommandConfigSchema = commandConfigSchema.append<PackCommandConfig>({
  src: Joi.string().required(),
  dst: Joi.string().required(),
  devPostfix: Joi.string().required(),
  postUpdate: Joi.array().items(Joi.string()).required()
});

export const packConfigSchema = Joi.object<PackConfig, true>({
  commands: Joi.array().items(packCommandConfigSchema.required()).required()
});
