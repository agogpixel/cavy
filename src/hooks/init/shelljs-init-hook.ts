import { Hook } from '@oclif/config';
import { config } from 'shelljs';

const hook: Hook<'init'> = async function () {
  config.silent = true;
};

export default hook;
