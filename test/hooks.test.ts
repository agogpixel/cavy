import { expect, test } from '@oclif/test';
import { config } from 'shelljs';

describe('hooks', () => {
  describe('init', () => {
    test
      .stdout()
      .hook('init')
      .do(() => expect(config.silent).equal(true))
      .it('sets shelljs silent config to true');
  });
});
