import Joi from 'joi';

import { PublishCommandConfig, PublishConfig } from '../models';

import { commandConfigSchema } from './command';

const publishCommandConfigSchema = commandConfigSchema.append<PublishCommandConfig>({
  packName: Joi.string().required(),
  preReleaseTag: Joi.string().required()
});

export const publishConfigSchema = Joi.object<PublishConfig, true>({
  commands: Joi.array().items(publishCommandConfigSchema.required()).required()
});
