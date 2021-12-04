// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../typings.d.ts" />

import { expect, test } from '@oclif/test';
import dotProp from 'dot-prop';
import { mkdir, rm } from 'shelljs';
import { JsonObject, PackageJson } from 'type-fest';

import { readJsonFile } from '../../src/utils';

const testResourcesPath = `${TEST_RESOURCES_PATH}/commands/copy`;
const testTmpPath = `${TEST_TMP_PATH}/commands/copy`;
const quietExitMessage = QUIET_EXIT_MESSAGE;

const tmpDistPath = `${testTmpPath}/dist`;

const missingCopyConfig = `${testResourcesPath}/missing-copy-config.json`;
const nonObjectCopyConfig = `${testResourcesPath}/non-object-copy-config.json`;

const missingCopyCommandsConfig = `${testResourcesPath}/missing-copy-commands-config.json`;
const nonArrayCopyCommandsConfig = `${testResourcesPath}/non-array-copy-commands-config.json`;
const emptyCopyCommandsConfig = `${testResourcesPath}/empty-copy-commands-config.json`;

const nonObjectCopyCommandConfig = `${testResourcesPath}/non-object-copy-command-config.json`;

const missingCopyCommandNameConfig = `${testResourcesPath}/missing-copy-command-name-config.json`;
const nonStringCopyCommandNameConfig = `${testResourcesPath}/non-string-copy-command-name-config.json`;
const emptyStringCopyCommandNameConfig = `${testResourcesPath}/empty-string-copy-command-name-config.json`;

const missingCopyCommandSrcConfig = `${testResourcesPath}/missing-copy-command-src-config.json`;
const nonStringCopyCommandSrcConfig = `${testResourcesPath}/non-string-copy-command-src-config.json`;
const emptyStringCopyCommandSrcConfig = `${testResourcesPath}/empty-string-copy-command-src-config.json`;

const missingCopyCommandDstConfig = `${testResourcesPath}/missing-copy-command-dst-config.json`;
const nonStringCopyCommandDstConfig = `${testResourcesPath}/non-string-copy-command-dst-config.json`;
const emptyStringCopyCommandDstConfig = `${testResourcesPath}/empty-string-copy-command-dst-config.json`;

const missingCopyCommandRedactConfig = `${testResourcesPath}/missing-copy-command-redact-config.json`;
const nonArrayCopyCommandRedactConfig = `${testResourcesPath}/non-array-copy-command-redact-config.json`;

const copyConfig = `${testResourcesPath}/copy-config.json`;
const forceCopyConfig = `${testResourcesPath}/force-copy-config.json`;

describe('Copy', () => {
  // Squelch console output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  describe('usage', () => {
    beforeEach(() => mkdir('-p', tmpDistPath));

    afterAll(() => rm('-rf', testTmpPath));

    test
      .stdout()
      .command(['copy', '--config', copyConfig, '--all'])
      .it(`[--config ${copyConfig} --all] runs all configured commands`, () => {
        const distPackageJson = readJsonFile<PackageJson & JsonObject>(`${tmpDistPath}/package.json`);
        expect(dotProp.has(distPackageJson, 'name')).to.equal(true);
        expect(dotProp.has(distPackageJson, 'version')).to.equal(true);
        expect(dotProp.has(distPackageJson, 'description')).to.equal(true);
        expect(dotProp.has(distPackageJson, 'removeMe')).to.equal(false);
        expect(dotProp.has(distPackageJson, 'keepMe')).to.equal(true);
        expect(dotProp.has(distPackageJson, 'keepMe.removeMe')).to.equal(false);
        expect(dotProp.has(distPackageJson, 'keepMe.keepMe')).to.equal(true);
      });

    test
      .stdout()
      .command(['copy', '--config', forceCopyConfig, '--all', '--force'])
      .it(
        `[--config ${forceCopyConfig} --all --force] runs all configured commands with matching source & destination paths via force flag`,
        () => {
          const distPackageJson = readJsonFile<PackageJson & JsonObject>(`${testResourcesPath}/force/package.json`);
          expect(dotProp.has(distPackageJson, 'name')).to.equal(true);
          expect(dotProp.has(distPackageJson, 'version')).to.equal(true);
          expect(dotProp.has(distPackageJson, 'description')).to.equal(true);
        }
      );

    test
      .stdout()
      .command(['copy', '--config', copyConfig, '--all', '--quiet'])
      .it(`[--config ${copyConfig} --all --quiet] runs all configured commands with output suppressed`, (ctx) =>
        expect(ctx.stdout.trim()).to.equal('')
      );

    test
      .stdout()
      .command(['copy', '--config', copyConfig, '--all', '--verbose'])
      .it(`[--config ${copyConfig} --all --verbose] runs all configured commands with verbose output`, (ctx) => {
        expect(ctx.stdout).to.contain('Available commands: test');
        expect(ctx.stdout).to.contain('Specified commands: test');
      });

    test
      .stdout()
      .command(['copy', '--config', copyConfig, 'test'])
      .it(`[--config ${copyConfig} test] runs specified command`, (ctx) =>
        expect(ctx.stdout).to.contain('test: no-force')
      );

    test
      .stdout()
      .command(['copy', '--config', copyConfig, 'test', '--quiet'])
      .it(`[--config ${copyConfig} test --quiet] runs specified command with output suppressed`, (ctx) =>
        expect(ctx.stdout.trim()).to.equal('')
      );
  });

  describe('error handling', () => {
    test
      .stderr()
      .command(['copy', '--config', forceCopyConfig, '--all'])
      .catch((ctx) => expect(ctx.message).to.contain('Copy had failure(s)'))
      .it(
        `[--config ${forceCopyConfig} --all] runs all configured commands with matching source & destination paths and reports error(s)`
      );

    test
      .stderr()
      .command(['copy', '--config', forceCopyConfig, '--all', '--quiet'])
      .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
      .it(`[--config ${forceCopyConfig} --all --quiet] runs all configured commands and suppresses error(s)`);

    //////////////////////////////////////////////////////////////////////////
    /// config
    //////////////////////////////////////////////////////////////////////////

    describe('config', () => {
      test
        .stderr()
        .command(['copy', '--config', missingCopyConfig])
        .catch((ctx) => expect(ctx.message).to.contain('Cavy copy config required'))
        .it(`[--config ${missingCopyConfig}] prints error message when cavy copy config is missing`);

      test
        .stderr()
        .command(['copy', '--config', missingCopyConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(`[--config ${missingCopyConfig} --quiet] suppresses error message when cavy copy config is missing`);

      test
        .stderr()
        .command(['copy', '--config', nonObjectCopyConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy copy config: ValidationError: "value" must be of type object')
        )
        .it(
          `[--config ${nonObjectCopyConfig}] prints error message when cavy copy config content is not a JSON object`
        );

      test
        .stderr()
        .command(['copy', '--config', nonObjectCopyConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonObjectCopyConfig} --quiet] suppresses error message when cavy copy config content is not a JSON object`
        );

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy copy config: ValidationError: "commands" is required')
        )
        .it(`[--config ${missingCopyCommandsConfig}] prints error message when cavy copy commands config is missing`);

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingCopyCommandsConfig} --quiet] suppresses error message when cavy copy commands config is missing`
        );

      test
        .stderr()
        .command(['copy', '--config', nonArrayCopyCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy copy config: ValidationError: "commands" must be an array')
        )
        .it(
          `[--config ${nonArrayCopyCommandsConfig}] prints error message when cavy copy commands config is not a JSON array`
        );

      test
        .stderr()
        .command(['copy', '--config', nonArrayCopyCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonArrayCopyCommandsConfig} --quiet] suppresses error message when cavy copy commands config is not a JSON array`
        );

      test
        .stderr()
        .command(['copy', '--config', emptyCopyCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy copy config: ValidationError: "commands" does not contain 1 required value(s)'
          )
        )
        .it(
          `[--config ${emptyCopyCommandsConfig}] prints error message when cavy copy commands config is empty JSON array`
        );

      test
        .stderr()
        .command(['copy', '--config', emptyCopyCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyCopyCommandsConfig} --quiet] suppresses error message when cavy copy commands config is empty JSON array`
        );

      test
        .stderr()
        .command(['copy', '--config', nonObjectCopyCommandConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy copy config: ValidationError: "commands[0]" must be of type object'
          )
        )
        .it(
          `[--config ${nonObjectCopyCommandConfig}] prints error message when a given cavy copy command config is not JSON object`
        );

      test
        .stderr()
        .command(['copy', '--config', nonObjectCopyCommandConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonObjectCopyCommandConfig} --quiet] suppresses error message when a given cavy copy command config is not JSON object`
        );

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy copy config: ValidationError: "commands[0].name" is required')
        )
        .it(
          `[--config ${missingCopyCommandNameConfig}] prints error message when a given cavy copy command name field is missing`
        );

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingCopyCommandNameConfig} --quiet] suppresses error message when a given cavy copy command name field is missing`
        );

      test
        .stderr()
        .command(['copy', '--config', nonStringCopyCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy copy config: ValidationError: "commands[0].name" must be a string'
          )
        )
        .it(
          `[--config ${nonStringCopyCommandNameConfig}] prints error message when a given cavy copy command name field is not a string`
        );

      test
        .stderr()
        .command(['copy', '--config', nonStringCopyCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringCopyCommandNameConfig} --quiet] suppresses error message when a given cavy copy command name field is not a string`
        );

      test
        .stderr()
        .command(['copy', '--config', emptyStringCopyCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy copy config: ValidationError: "commands[0].name" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringCopyCommandNameConfig}] prints error message when a given cavy copy command name field is an empty string`
        );

      test
        .stderr()
        .command(['copy', '--config', emptyStringCopyCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringCopyCommandNameConfig} --quiet] suppresses error message when a given cavy copy command name field is an empty string`
        );

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandSrcConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy copy config: ValidationError: "commands[0].src" is required')
        )
        .it(
          `[--config ${missingCopyCommandSrcConfig}] prints error message when a given cavy copy command src field is missing`
        );

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandSrcConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingCopyCommandSrcConfig} --quiet] suppresses error message when a given cavy copy command src field is missing`
        );

      test
        .stderr()
        .command(['copy', '--config', nonStringCopyCommandSrcConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy copy config: ValidationError: "commands[0].src" must be a string'
          )
        )
        .it(
          `[--config ${nonStringCopyCommandSrcConfig}] prints error message when a given cavy copy command src field is not a string`
        );

      test
        .stderr()
        .command(['copy', '--config', nonStringCopyCommandSrcConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringCopyCommandSrcConfig} --quiet] suppresses error message when a given cavy copy command src field is not a string`
        );

      test
        .stderr()
        .command(['copy', '--config', emptyStringCopyCommandSrcConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy copy config: ValidationError: "commands[0].src" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringCopyCommandSrcConfig}] prints error message when a given cavy copy command src field is an empty string`
        );

      test
        .stderr()
        .command(['copy', '--config', emptyStringCopyCommandSrcConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringCopyCommandSrcConfig} --quiet] suppresses error message when a given cavy copy command src field is an empty string`
        );

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandDstConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy copy config: ValidationError: "commands[0].dst" is required')
        )
        .it(
          `[--config ${missingCopyCommandDstConfig}] prints error message when a given cavy copy command dst field is missing`
        );

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandDstConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingCopyCommandDstConfig} --quiet] suppresses error message when a given cavy copy command dst field is missing`
        );

      test
        .stderr()
        .command(['copy', '--config', nonStringCopyCommandDstConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy copy config: ValidationError: "commands[0].dst" must be a string'
          )
        )
        .it(
          `[--config ${nonStringCopyCommandDstConfig}] prints error message when a given cavy copy command dst field is not a string`
        );

      test
        .stderr()
        .command(['copy', '--config', nonStringCopyCommandDstConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringCopyCommandDstConfig} --quiet] suppresses error message when a given cavy copy command dst field is not a string`
        );

      test
        .stderr()
        .command(['copy', '--config', emptyStringCopyCommandDstConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy copy config: ValidationError: "commands[0].dst" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringCopyCommandDstConfig}] prints error message when a given cavy copy command dst field is an empty string`
        );

      test
        .stderr()
        .command(['copy', '--config', emptyStringCopyCommandDstConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringCopyCommandDstConfig} --quiet] suppresses error message when a given cavy copy command dst field is an empty string`
        );

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandRedactConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy copy config: ValidationError: "commands[0].redact" is required')
        )
        .it(
          `[--config ${missingCopyCommandRedactConfig}] prints error message when a given cavy copy command redact field is missing`
        );

      test
        .stderr()
        .command(['copy', '--config', missingCopyCommandRedactConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingCopyCommandRedactConfig} --quiet] suppresses error message when a given cavy copy command redact field is missing`
        );

      test
        .stderr()
        .command(['copy', '--config', nonArrayCopyCommandRedactConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy copy config: ValidationError: "commands[0].redact" must be an array'
          )
        )
        .it(
          `[--config ${nonArrayCopyCommandRedactConfig}] prints error message when a given cavy copy command redact field is not an array`
        );

      test
        .stderr()
        .command(['copy', '--config', nonArrayCopyCommandRedactConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonArrayCopyCommandRedactConfig} --quiet] suppresses error message when a given cavy copy command redact field is not an array`
        );
    });

    //////////////////////////////////////////////////////////////////////////
    /// input
    //////////////////////////////////////////////////////////////////////////

    describe('input', () => {
      test
        .stderr()
        .command(['copy', '--config', copyConfig])
        .catch((ctx) => {
          expect(ctx.message).to.contain('No copy commands were specified');
          expect(ctx.message).to.contain('--all required');
        })
        .it(`[--config ${copyConfig}] prints error message when no arguments or options provided`);

      test
        .stderr()
        .command(['copy', '--config', copyConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(`[--config ${copyConfig} --quiet] suppresses error message when no arguments or options provided`);

      test
        .stderr()
        .command(['copy', '--config', copyConfig, 'test-config', '--all'])
        .catch((ctx) => {
          expect(ctx.message).to.contain('Commands were specified for copy');
          expect(ctx.message).to.contain('--all invalid');
        })
        .it(`[--config ${copyConfig} test --all] prints error message when arguments & --all option provided`);

      test
        .stderr()
        .command(['copy', '--config', copyConfig, 'test-config', '--all', '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(
          `[--config ${copyConfig} test --all --quiet] suppresses error message when arguments & --all option provided`
        );

      test
        .stderr()
        .command(['copy', '--config', copyConfig, 'failit'])
        .catch((ctx) => expect(ctx.message).to.contain('Commands not found in cavy copy config: failit'))
        .it(`[--config ${copyConfig} failit] prints error message when unknown command argument provided`);

      test
        .stderr()
        .command(['copy', '--config', copyConfig, 'failit', '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(`[--config ${copyConfig} failit --quiet] suppresses error message when unknown command argument provided`);
    });
  });
});
