// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../typings.d.ts" />

import { expect, test } from '@oclif/test';
import { mkdir, rm, touch } from 'shelljs';

const testResourcesPath = `${TEST_RESOURCES_PATH}/commands/clean`;
const testTmpPath = `${TEST_TMP_PATH}/commands/clean`;
const quietExitMessage = QUIET_EXIT_MESSAGE;

const tmpDirPathA = `${testTmpPath}/tmpA`;
const tmpFilePathA = `${testTmpPath}/tmpA.txt`;

const tmpDirPathB = `${testTmpPath}/tmpB`;
const tmpFilePathB = `${testTmpPath}/tmpB.txt`;

const missingCleanConfig = `${testResourcesPath}/missing-clean-config.json`;
const nonObjectCleanConfig = `${testResourcesPath}/non-object-clean-config.json`;

const missingCleanCommandsConfig = `${testResourcesPath}/missing-clean-commands-config.json`;
const nonArrayCleanCommandsConfig = `${testResourcesPath}/non-array-clean-commands-config.json`;
const emptyCleanCommandsConfig = `${testResourcesPath}/empty-clean-commands-config.json`;

const nonObjectCleanCommandConfig = `${testResourcesPath}/non-object-clean-command-config.json`;

const missingCleanCommandNameConfig = `${testResourcesPath}/missing-clean-command-name-config.json`;
const nonStringCleanCommandNameConfig = `${testResourcesPath}/non-string-clean-command-name-config.json`;
const emptyStringCleanCommandNameConfig = `${testResourcesPath}/empty-string-clean-command-name-config.json`;

const missingCleanCommandDirsConfig = `${testResourcesPath}/missing-clean-command-dirs-config.json`;
const nonArrayCleanCommandDirsConfig = `${testResourcesPath}/non-array-clean-command-dirs-config.json`;

const missingCleanCommandFilesConfig = `${testResourcesPath}/missing-clean-command-files-config.json`;
const nonArrayCleanCommandFilesConfig = `${testResourcesPath}/non-array-clean-command-files-config.json`;

const nonStringCleanCommandDirConfig = `${testResourcesPath}/non-string-clean-command-dir-config.json`;
const emptyStringCleanCommandDirConfig = `${testResourcesPath}/empty-string-clean-command-dir-config.json`;

const nonStringCleanCommandFileConfig = `${testResourcesPath}/non-string-clean-command-file-config.json`;
const emptyStringCleanCommandFileConfig = `${testResourcesPath}/empty-string-clean-command-file-config.json`;

const cleanConfig = `${testResourcesPath}/clean-config.json`;
const cleanEmptyTargetsConfig = `${testResourcesPath}/clean-empty-targets-config.json`;

describe('Clean', () => {
  // Squelch console output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  describe('usage', () => {
    beforeEach(() => {
      mkdir('-p', tmpDirPathA);
      mkdir('-p', tmpDirPathB);
      touch(tmpFilePathA);
      touch(tmpFilePathB);
    });

    afterAll(() => rm('-rf', testTmpPath));

    test
      .stdout()
      .command(['clean', '--config', cleanConfig, '--all'])
      .it(`[--config ${cleanConfig} --all] runs all configured commands`, (ctx) => {
        expect(ctx.stdout).to.contain('test-config: force');
        expect(ctx.stdout).to.contain('test-config2: force');
      });

    test
      .stdout()
      .command(['clean', '--config', cleanConfig, '--all', '--no-force'])
      .it(`[--config ${cleanConfig} --all --no-force] runs all configured commands without force`, (ctx) => {
        expect(ctx.stdout).to.contain('test-config: no-force');
        expect(ctx.stdout).to.contain('test-config2: no-force');
      });

    test
      .stdout()
      .command(['clean', '--config', cleanConfig, '--all', '--quiet'])
      .it(`[--config ${cleanConfig} --all --quiet] runs all configured commands with output suppressed`, (ctx) =>
        expect(ctx.stdout.trim()).to.equal('')
      );

    test
      .stdout()
      .command(['clean', '--config', cleanConfig, '--all', '--verbose'])
      .it(`[--config ${cleanConfig} --all --verbose] runs all configured commands with verbose output`, (ctx) => {
        expect(ctx.stdout).to.contain('Available commands: test-config, test-config2');
        expect(ctx.stdout).to.contain('Specified commands: test-config, test-config2');
      });

    test
      .stdout()
      .command(['clean', '--config', cleanConfig, 'test-config'])
      .it(`[--config ${cleanConfig} test-config] runs specified command`, (ctx) => {
        expect(ctx.stdout).to.contain('test-config: force');
        expect(ctx.stdout).to.not.contain('test-config2: force');
      });

    test
      .stdout()
      .command(['clean', '--config', cleanConfig, 'test-config', '--no-force'])
      .it(`[--config ${cleanConfig} test-config --no-force] runs specified command without force`, (ctx) => {
        expect(ctx.stdout).to.contain('test-config: no-force');
        expect(ctx.stdout).to.not.contain('test-config2: no-force');
      });

    test
      .stdout()
      .command(['clean', '--config', cleanConfig, 'test-config', '--quiet'])
      .it(`[--config ${cleanConfig} test-config --quiet] runs specified command with output suppressed`, (ctx) =>
        expect(ctx.stdout.trim()).to.equal('')
      );

    test
      .stdout()
      .command(['clean', '--config', cleanConfig, 'test-config', '--verbose'])
      .it(`[--config ${cleanConfig} test-config --verbose] runs specified command with verbose output`, (ctx) => {
        expect(ctx.stdout).to.contain('Available commands: test-config, test-config2');
        expect(ctx.stdout).to.contain('Specified commands: test-config');
      });

    test
      .stdout()
      .command(['clean', '--config', cleanEmptyTargetsConfig, '--all'])
      .it(`[--config ${cleanConfig} --all] runs all configured commands and skips empty targets`, (ctx) => {
        expect(ctx.stdout).to.contain('Directories: skipping!');
        expect(ctx.stdout).to.contain('Files: skipping!');
      });
  });

  describe('error handling', () => {
    test
      .stderr()
      .command(['clean', '--config', cleanConfig, '--all', '--no-force'])
      .catch((ctx) => expect(ctx.message).to.contain('Clean had failure(s)'))
      .it(`[--config ${cleanConfig} --all --no-force] runs all configured commands and reports error(s)`);

    test
      .stderr()
      .command(['clean', '--config', cleanConfig, '--all', '--quiet', '--no-force'])
      .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
      .it(`[--config ${cleanConfig} --all --quiet --no-force] runs all configured commands and suppresses error(s)`);

    //////////////////////////////////////////////////////////////////////////
    /// config
    //////////////////////////////////////////////////////////////////////////

    describe('config', () => {
      test
        .stderr()
        .command(['clean', '--config', missingCleanConfig])
        .catch((ctx) => expect(ctx.message).to.contain('Cavy clean config required'))
        .it(`[--config ${missingCleanConfig}] prints error message when cavy clean config is missing`);

      test
        .stderr()
        .command(['clean', '--config', missingCleanConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(`[--config ${missingCleanConfig} --quiet] suppresses error message when cavy clean config is missing`);

      test
        .stderr()
        .command(['clean', '--config', nonObjectCleanConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy clean config: ValidationError: "value" must be of type object')
        )
        .it(
          `[--config ${nonObjectCleanConfig}] prints error message when cavy clean config content is not a JSON object`
        );

      test
        .stderr()
        .command(['clean', '--config', nonObjectCleanConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonObjectCleanConfig} --quiet] suppresses error message when cavy clean config content is not a JSON object`
        );

      test
        .stderr()
        .command(['clean', '--config', missingCleanCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy clean config: ValidationError: "commands" is required')
        )
        .it(`[--config ${missingCleanCommandsConfig}] prints error message when cavy clean commands config is missing`);

      test
        .stderr()
        .command(['clean', '--config', missingCleanCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingCleanCommandsConfig} --quiet] suppresses error message when cavy clean commands config is missing`
        );

      test
        .stderr()
        .command(['clean', '--config', nonArrayCleanCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy clean config: ValidationError: "commands" must be an array')
        )
        .it(
          `[--config ${nonArrayCleanCommandsConfig}] prints error message when cavy clean commands config is not a JSON array`
        );

      test
        .stderr()
        .command(['clean', '--config', nonArrayCleanCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonArrayCleanCommandsConfig} --quiet] suppresses error message when cavy clean commands config is not a JSON array`
        );

      test
        .stderr()
        .command(['clean', '--config', emptyCleanCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands" does not contain 1 required value(s)'
          )
        )
        .it(
          `[--config ${emptyCleanCommandsConfig}] prints error message when cavy clean commands config is empty JSON array`
        );

      test
        .stderr()
        .command(['clean', '--config', emptyCleanCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyCleanCommandsConfig} --quiet] suppresses error message when cavy clean commands config is empty JSON array`
        );

      test
        .stderr()
        .command(['clean', '--config', nonObjectCleanCommandConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands[0]" must be of type object'
          )
        )
        .it(
          `[--config ${nonObjectCleanCommandConfig}] prints error message when a given cavy clean command config is not JSON object`
        );

      test
        .stderr()
        .command(['clean', '--config', nonObjectCleanCommandConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonObjectCleanCommandConfig} --quiet] suppresses error message when a given cavy clean command config is not JSON object`
        );

      test
        .stderr()
        .command(['clean', '--config', missingCleanCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy clean config: ValidationError: "commands[0].name" is required')
        )
        .it(
          `[--config ${missingCleanCommandNameConfig}] prints error message when a given cavy clean command name field is missing`
        );

      test
        .stderr()
        .command(['clean', '--config', missingCleanCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingCleanCommandNameConfig} --quiet] suppresses error message when a given cavy clean command name field is missing`
        );

      test
        .stderr()
        .command(['clean', '--config', nonStringCleanCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands[0].name" must be a string'
          )
        )
        .it(
          `[--config ${nonStringCleanCommandNameConfig}] prints error message when a given cavy clean command name field is not a string`
        );

      test
        .stderr()
        .command(['clean', '--config', nonStringCleanCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringCleanCommandNameConfig} --quiet] suppresses error message when a given cavy clean command name field is not a string`
        );

      test
        .stderr()
        .command(['clean', '--config', emptyStringCleanCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands[0].name" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringCleanCommandNameConfig}] prints error message when a given cavy clean command name field is an empty string`
        );

      test
        .stderr()
        .command(['clean', '--config', emptyStringCleanCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringCleanCommandNameConfig} --quiet] suppresses error message when a given cavy clean command name field is an empty string`
        );

      test
        .stderr()
        .command(['clean', '--config', missingCleanCommandDirsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy clean config: ValidationError: "commands[0].dirs" is required')
        )
        .it(
          `[--config ${missingCleanCommandDirsConfig}] prints error message when a given cavy clean command dirs field is missing`
        );

      test
        .stderr()
        .command(['clean', '--config', missingCleanCommandDirsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingCleanCommandDirsConfig} --quiet] suppresses error message when a given cavy clean command dirs field is missing`
        );

      test
        .stderr()
        .command(['clean', '--config', nonArrayCleanCommandDirsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands[0].dirs" must be an array'
          )
        )
        .it(
          `[--config ${nonArrayCleanCommandDirsConfig}] prints error message when a given cavy clean command dirs field is not an array`
        );

      test
        .stderr()
        .command(['clean', '--config', nonArrayCleanCommandDirsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonArrayCleanCommandDirsConfig} --quiet] suppresses error message when a given cavy clean command dirs field is not an array`
        );

      test
        .stderr()
        .command(['clean', '--config', missingCleanCommandFilesConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy clean config: ValidationError: "commands[0].files" is required')
        )
        .it(
          `[--config ${missingCleanCommandFilesConfig}] prints error message when a given cavy clean command files field is missing`
        );

      test
        .stderr()
        .command(['clean', '--config', missingCleanCommandFilesConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingCleanCommandFilesConfig} --quiet] suppresses error message when a given cavy clean command files field is missing`
        );

      test
        .stderr()
        .command(['clean', '--config', nonArrayCleanCommandFilesConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands[0].files" must be an array'
          )
        )
        .it(
          `[--config ${nonArrayCleanCommandFilesConfig}] prints error message when a given cavy clean command files field is not an array`
        );

      test
        .stderr()
        .command(['clean', '--config', nonArrayCleanCommandFilesConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonArrayCleanCommandFilesConfig} --quiet] suppresses error message when a given cavy clean command files field is not an array`
        );

      test
        .stderr()
        .command(['clean', '--config', nonStringCleanCommandDirConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands[0].dirs[0]" must be a string'
          )
        )
        .it(
          `[--config ${nonStringCleanCommandDirConfig}] prints error message when a given cavy clean command dir is not a string`
        );

      test
        .stderr()
        .command(['clean', '--config', nonStringCleanCommandDirConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringCleanCommandDirConfig} --quiet] suppresses error message when a given cavy clean command dir is not a string`
        );

      test
        .stderr()
        .command(['clean', '--config', emptyStringCleanCommandDirConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands[0].dirs[0]" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringCleanCommandDirConfig}] prints error message when a given cavy clean command dir is an empty string`
        );

      test
        .stderr()
        .command(['clean', '--config', emptyStringCleanCommandDirConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringCleanCommandDirConfig} --quiet] suppresses error message when a given cavy clean command dir is an empty string`
        );

      test
        .stderr()
        .command(['clean', '--config', nonStringCleanCommandFileConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands[0].files[0]" must be a string'
          )
        )
        .it(
          `[--config ${nonStringCleanCommandFileConfig}] prints error message when a given cavy clean command file is not a string`
        );

      test
        .stderr()
        .command(['clean', '--config', nonStringCleanCommandFileConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringCleanCommandFileConfig} --quiet] suppresses error message when a given cavy clean command file is not a string`
        );

      test
        .stderr()
        .command(['clean', '--config', emptyStringCleanCommandFileConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy clean config: ValidationError: "commands[0].files[0]" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringCleanCommandFileConfig}] prints error message when a given cavy clean command file is an empty string`
        );

      test
        .stderr()
        .command(['clean', '--config', emptyStringCleanCommandFileConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringCleanCommandFileConfig} --quiet] suppresses error message when a given cavy clean command file is an empty string`
        );
    });

    //////////////////////////////////////////////////////////////////////////
    /// input
    //////////////////////////////////////////////////////////////////////////

    describe('input', () => {
      test
        .stderr()
        .command(['clean', '--config', cleanConfig])
        .catch((ctx) => {
          expect(ctx.message).to.contain('No clean commands were specified');
          expect(ctx.message).to.contain('--all required');
        })
        .it(`[--config ${cleanConfig}] prints error message when no arguments or options provided`);

      test
        .stderr()
        .command(['clean', '--config', cleanConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(`[--config ${cleanConfig} --quiet] suppresses error message when no arguments or options provided`);

      test
        .stderr()
        .command(['clean', '--config', cleanConfig, 'test-config', '--all'])
        .catch((ctx) => {
          expect(ctx.message).to.contain('Commands were specified for clean');
          expect(ctx.message).to.contain('--all invalid');
        })
        .it(`[--config ${cleanConfig} test-config --all] prints error message when arguments & --all option provided`);

      test
        .stderr()
        .command(['clean', '--config', cleanConfig, 'test-config', '--all', '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(
          `[--config ${cleanConfig} test-config --all --quiet] suppresses error message when arguments & --all option provided`
        );

      test
        .stderr()
        .command(['clean', '--config', cleanConfig, 'failit'])
        .catch((ctx) => expect(ctx.message).to.contain('Commands not found in cavy clean config: failit'))
        .it(`[--config ${cleanConfig} failit] prints error message when unknown command argument provided`);

      test
        .stderr()
        .command(['clean', '--config', cleanConfig, 'failit', '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(`[--config ${cleanConfig} failit --quiet] suppresses error message when unknown command argument provided`);
    });
  });
});
