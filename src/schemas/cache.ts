import Joi from 'joi';

import { Cache } from '../models';

export const cacheSchema = Joi.object<Record<string, Cache>, true>().pattern(
  Joi.string(),
  Joi.object<Cache>({
    tarballs: Joi.object<Record<string, string[]>>().pattern(Joi.string(), Joi.array().items(Joi.string()).required()),
    tags: Joi.object<Record<string, Record<string, string[]>>>().pattern(
      Joi.string(),
      Joi.object<Record<string, string[]>>().pattern(Joi.string(), Joi.array().items(Joi.string()).required())
    )
  })
);
