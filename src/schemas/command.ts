import Joi from 'joi';

import { CommandConfig } from '../models';

export const commandConfigSchema = Joi.object<CommandConfig, true>({
  name: Joi.string().required()
});
