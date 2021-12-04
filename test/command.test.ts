// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./typings.d.ts" />

const testResourcesPath = `${TEST_RESOURCES_PATH}/command`;
const quietExitMessage = QUIET_EXIT_MESSAGE;

const malformedCavyConfig = `${testResourcesPath}/malformed-cavy-config.json`;
const nonObjectCavyConfig = `${testResourcesPath}/non-object-cavy-config.json`;
const missingKeyCavyConfig = `${testResourcesPath}/missing-key-cavy-config.json`;
const invalidSchemaCavyConfig = `${testResourcesPath}/invalid-schema-cavy-config.json`;
const validCavyConfig = `${testResourcesPath}/valid-cavy-config.json`;

import Command from '../src/command';
import { lintConfigSchema } from '../src/schemas';

class TestCommand extends Command {
  static description = 'test command';

  static flags = {
    ...Command.flags
  };

  static args = [...Command.args];

  protected readonly name = 'lint';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  protected readonly schema = lintConfigSchema;

  async run() {
    this.verbose('VERBOSE');
    this.warn('WARN');
    this.log('LOG');
  }
}

describe('Command', () => {
  // Squelch console output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  describe('usage', () => {
    it('[--all] can load default cavy config file', async () =>
      expect(await TestCommand.run(['--all'])).toBeUndefined());

    it('[--all --verbose] can load default cavy config file', async () =>
      expect(await TestCommand.run(['--all', '--verbose'])).toBeUndefined());

    it('[--all --quiet] can load default cavy config file', async () =>
      expect(await TestCommand.run(['--all', '--quiet'])).toBeUndefined());
  });

  describe('error handling', () => {
    ////////////////////////////////////////////////////////////////////////////
    /// config
    ////////////////////////////////////////////////////////////////////////////

    describe('config', () => {
      it('[--config nofind] prints error message when no cavy config file found', async () =>
        await expect(async () => await TestCommand.run(['--config', 'nofind'])).rejects.toThrow(
          /.*Failed loading cavy config file.*/
        ));

      it('[--config nofind --quiet] suppresses error message when no cavy config file found', async () =>
        await expect(async () => await TestCommand.run(['--config', 'nofind', '--quiet'])).rejects.toThrow(
          quietExitMessage
        ));

      it(`[--config ${malformedCavyConfig}] prints error message when malformed cavy config file found`, async () => {
        try {
          await TestCommand.run(['--config', malformedCavyConfig]);
        } catch (e) {
          expect((e as Error).message).toContain('Failed loading cavy config file:');
          expect((e as Error).message).toContain('Unexpected token');
        }
      });

      it(`[--config ${malformedCavyConfig} --quiet]suppresses error message when malformed cavy config file found`, async () =>
        await expect(async () => await TestCommand.run(['--config', malformedCavyConfig, '--quiet'])).rejects.toThrow(
          quietExitMessage
        ));

      it(`[--config ${nonObjectCavyConfig}] prints error message when cavy config content is not a JSON object`, async () =>
        await expect(async () => await TestCommand.run(['--config', nonObjectCavyConfig])).rejects.toThrow(
          /.*Invalid cavy config file contents.*/
        ));

      it(`[--config ${nonObjectCavyConfig} --quiet] suppresses error message when cavy config content is not a JSON object`, async () =>
        await expect(async () => await TestCommand.run(['--config', nonObjectCavyConfig, '--quiet'])).rejects.toThrow(
          quietExitMessage
        ));

      it(`[--config ${missingKeyCavyConfig}] prints error message when cavy config content slice is not found`, async () =>
        await expect(async () => await TestCommand.run(['--config', missingKeyCavyConfig])).rejects.toThrow(
          /.*Cavy lint config required.*/
        ));

      it(`[--config ${missingKeyCavyConfig} --quiet] suppresses error message when cavy config content slice is not found`, async () =>
        await expect(async () => await TestCommand.run(['--config', missingKeyCavyConfig, '--quiet'])).rejects.toThrow(
          quietExitMessage
        ));

      it(`[--config ${invalidSchemaCavyConfig}] prints error message when cavy config content slice schema is invalid`, async () =>
        await expect(async () => await TestCommand.run(['--config', invalidSchemaCavyConfig])).rejects.toThrow(
          /.*Invalid cavy lint config.*/
        ));

      it(`[--config ${invalidSchemaCavyConfig} --quiet] suppresses error message when cavy config content slice schema is invalid`, async () =>
        await expect(
          async () => await TestCommand.run(['--config', invalidSchemaCavyConfig, '--quiet'])
        ).rejects.toThrow(quietExitMessage));
    });

    ////////////////////////////////////////////////////////////////////////////
    /// input
    ////////////////////////////////////////////////////////////////////////////

    describe('input', () => {
      it(`[--config ${validCavyConfig}] prints error when no arguments or --all flag provided`, async () =>
        await expect(async () => await TestCommand.run(['--config', validCavyConfig])).rejects.toThrow(
          /.*No lint commands were specified: --all required.*/
        ));

      it(`[--config ${validCavyConfig} --quiet] suppresses error when no arguments or --all flag provided`, async () =>
        await expect(async () => await TestCommand.run(['--config', validCavyConfig, '--quiet'])).rejects.toThrow(
          quietExitMessage
        ));

      it(`[--config ${validCavyConfig} --all testA] prints error when arguments & --all flag provided`, async () =>
        await expect(
          async () => await TestCommand.run(['--config', validCavyConfig, '--all', 'testA'])
        ).rejects.toThrow(/.*Commands were specified for lint: --all invalid.*/));

      it(`[--config ${validCavyConfig} --quiet --all testA] suppresses error when arguments & --all flag provided`, async () =>
        await expect(
          async () => await TestCommand.run(['--config', validCavyConfig, '--quiet', '--all', 'testA'])
        ).rejects.toThrow(quietExitMessage));

      it(`[--config ${validCavyConfig} failit] prints error when argument is invalid`, async () =>
        await expect(async () => await TestCommand.run(['--config', validCavyConfig, 'failit'])).rejects.toThrow(
          /.*Commands not found in cavy lint config.*/
        ));

      it(`[--config ${validCavyConfig} failit] suppresses error when argument is invalid`, async () =>
        await expect(
          async () => await TestCommand.run(['--config', validCavyConfig, '--quiet', 'failit'])
        ).rejects.toThrow(quietExitMessage));
    });
  });
});
