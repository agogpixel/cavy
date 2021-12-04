import Joi from 'joi';

import { Config } from '../models';

import { cleanConfigSchema } from './clean';
import { copyConfigSchema } from './copy';
import { lintConfigSchema } from './lint';
import { packConfigSchema } from './pack';
import { publishConfigSchema } from './publish';

export const partialConfigSchema = Joi.object<Partial<Config>, true>();

export const fullConfigSchema = Joi.object<Config>({
  lint: lintConfigSchema,
  clean: cleanConfigSchema,
  copy: copyConfigSchema,
  pack: packConfigSchema,
  publish: publishConfigSchema
});
