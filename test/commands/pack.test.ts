// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../typings.d.ts" />

import { expect, test } from '@oclif/test';
import { existsSync } from 'fs';
import { cp, ls, mkdir, rm } from 'shelljs';

const testResourcesPath = `${TEST_RESOURCES_PATH}/commands/pack`;
const testTmpPath = `${TEST_TMP_PATH}/commands/pack`;
const quietExitMessage = QUIET_EXIT_MESSAGE;

const missingPackConfig = `${testResourcesPath}/missing-pack-config.json`;
const nonObjectPackConfig = `${testResourcesPath}/non-object-pack-config.json`;

const missingPackCommandsConfig = `${testResourcesPath}/missing-pack-commands-config.json`;
const nonArrayPackCommandsConfig = `${testResourcesPath}/non-array-pack-commands-config.json`;
const emptyPackCommandsConfig = `${testResourcesPath}/empty-pack-commands-config.json`;

const nonObjectPackCommandConfig = `${testResourcesPath}/non-object-pack-command-config.json`;

const missingPackCommandNameConfig = `${testResourcesPath}/missing-pack-command-name-config.json`;
const nonStringPackCommandNameConfig = `${testResourcesPath}/non-string-pack-command-name-config.json`;
const emptyStringPackCommandNameConfig = `${testResourcesPath}/empty-string-pack-command-name-config.json`;

const missingPackCommandSrcConfig = `${testResourcesPath}/missing-pack-command-src-config.json`;
const nonStringPackCommandSrcConfig = `${testResourcesPath}/non-string-pack-command-src-config.json`;
const emptyStringPackCommandSrcConfig = `${testResourcesPath}/empty-string-pack-command-src-config.json`;

const missingPackCommandDstConfig = `${testResourcesPath}/missing-pack-command-dst-config.json`;
const nonStringPackCommandDstConfig = `${testResourcesPath}/non-string-pack-command-dst-config.json`;
const emptyStringPackCommandDstConfig = `${testResourcesPath}/empty-string-pack-command-dst-config.json`;

const missingPackCommandDevPostfixConfig = `${testResourcesPath}/missing-pack-command-dev-postfix-config.json`;
const nonStringPackCommandDevPostfixConfig = `${testResourcesPath}/non-string-pack-command-dev-postfix-config.json`;
const emptyStringPackCommandDevPostfixConfig = `${testResourcesPath}/empty-string-pack-command-dev-postfix-config.json`;

const missingPackCommandPostUpdateConfig = `${testResourcesPath}/missing-pack-command-post-update-config.json`;
const nonArrayPackCommandPostUpdateConfig = `${testResourcesPath}/non-array-pack-command-post-update-config.json`;

const preReleasePackConfig = `${testResourcesPath}/prerelease-pack-config.json`;
const packConfig = `${testResourcesPath}/pack-config.json`;
const invalidPathsPackConfig = `${testResourcesPath}/invalid-paths-pack-config.json`;
const failingPackConfig = `${testResourcesPath}/failing-pack-config.json`;
const postUpdateFailPackConfig = `${testResourcesPath}/post-update-fail-pack-config.json`;

describe('Pack', () => {
  // Squelch console output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  beforeEach(() => {
    mkdir('-p', testTmpPath);
    cp('-rn', `${testResourcesPath}/prerelease-dist`, testTmpPath);
  });

  afterAll(() => rm('-rf', testTmpPath));

  describe('usage', () => {
    test
      .stdout()
      .command(['pack', '--config', preReleasePackConfig, '--all'])
      .it(`[--config ${preReleasePackConfig} --all] runs all configured commands`, () =>
        expect(ls(`${testTmpPath}/agogpixel-cavy-pack-test-0.0.0--dev-build-*.tgz`).length > 0).to.equal(true)
      );

    test
      .stdout()
      .command(['pack', '--config', preReleasePackConfig, '--all'])
      .it(`[--config ${preReleasePackConfig} --all] runs all configured commands (#2)`, () =>
        expect(ls(`${testTmpPath}/agogpixel-cavy-pack-test-0.0.0--dev-build-*.tgz`).length > 0).to.equal(true)
      );

    test
      .stdout()
      .command(['pack', '--config', packConfig, '--all', '--release'])
      .it(`[--config ${packConfig} --all --release] runs all configured commands`, () =>
        expect(existsSync(`${testTmpPath}/agogpixel-cavy-pack-test-0.0.0.tgz`)).to.equal(true)
      );
  });

  describe('error handling', () => {
    test
      .stderr()
      .command(['pack', '--config', invalidPathsPackConfig, '--all'])
      .catch((ctx) => expect(ctx.message).to.contain('Pack had failure(s)'))
      .it(`[--config ${invalidPathsPackConfig} --all] reports error when paths invalid`);

    test
      .stderr()
      .command(['pack', '--config', invalidPathsPackConfig, '--all', '--quiet'])
      .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
      .it(`[--config ${invalidPathsPackConfig} --all --quiet] suppresses error when paths invalid`);

    test
      .stderr()
      .command(['pack', '--config', invalidPathsPackConfig, '--all', '--release'])
      .catch((ctx) => expect(ctx.message).to.contain('Pack had failure(s)'))
      .it(`[--config ${invalidPathsPackConfig} --all --release] reports error when paths invalid`);

    test
      .stderr()
      .command(['pack', '--config', invalidPathsPackConfig, '--all', '--quiet', '--release'])
      .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
      .it(`[--config ${invalidPathsPackConfig} --all --quiet --release] suppresses error when paths invalid`);

    test
      .stderr()
      .command(['pack', '--config', invalidPathsPackConfig, 'test'])
      .catch((ctx) => expect(ctx.message).to.contain('Pack had failure(s)'))
      .it(`[--config ${invalidPathsPackConfig} test] reports error when paths invalid`);

    test
      .stderr()
      .command(['pack', '--config', invalidPathsPackConfig, 'test', '--quiet'])
      .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
      .it(`[--config ${invalidPathsPackConfig} test --quiet] suppresses error when paths invalid`);

    test
      .stderr()
      .command(['pack', '--config', failingPackConfig, '--all'])
      .catch((ctx) => expect(ctx.message).to.contain('Pack had failure(s)'))
      .it(`[--config ${failingPackConfig} --all] runs all configured commands & reports error(s)`);

    test
      .stderr()
      .command(['pack', '--config', failingPackConfig, '--all', '--quiet'])
      .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
      .it(`[--config ${failingPackConfig} --all --quiet] runs all configured commands & suppresses error(s)`);

    test
      .stderr()
      .command(['pack', '--config', failingPackConfig, '--all', '--release'])
      .catch((ctx) => expect(ctx.message).to.contain('Pack had failure(s)'))
      .it(`[--config ${failingPackConfig} --all --release] runs all configured commands & reports error(s)`);

    test
      .stderr()
      .command(['pack', '--config', failingPackConfig, '--all', '--quiet', '--release'])
      .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
      .it(`[--config ${failingPackConfig} --all --quiet --release] runs all configured commands & suppresses error(s)`);

    test
      .stderr()
      .command(['pack', '--config', failingPackConfig, 'test'])
      .catch((ctx) => expect(ctx.message).to.contain('Pack had failure(s)'))
      .it(`[--config ${failingPackConfig} test] reports error`);

    test
      .stderr()
      .command(['pack', '--config', failingPackConfig, 'test', '--quiet'])
      .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
      .it(`[--config ${failingPackConfig} test --quiet] suppresses error`);

    test
      .stderr()
      .command(['pack', '--config', postUpdateFailPackConfig, '--all', '--release'])
      .catch((ctx) => expect(ctx.message).to.contain('Pack had failure(s)'))
      .it(`[--config ${postUpdateFailPackConfig} --all] runs all configured commands & reports error(s)`);

    //////////////////////////////////////////////////////////////////////////
    /// config
    //////////////////////////////////////////////////////////////////////////

    describe('config', () => {
      test
        .stderr()
        .command(['pack', '--config', missingPackConfig])
        .catch((ctx) => expect(ctx.message).to.contain('Cavy pack config required'))
        .it(`[--config ${missingPackConfig}] prints error message when cavy pack config is missing`);

      test
        .stderr()
        .command(['pack', '--config', missingPackConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(`[--config ${missingPackConfig} --quiet] suppresses error message when cavy pack config is missing`);

      test
        .stderr()
        .command(['pack', '--config', nonObjectPackConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy pack config: ValidationError: "value" must be of type object')
        )
        .it(
          `[--config ${nonObjectPackConfig}] prints error message when cavy pack config content is not a JSON object`
        );

      test
        .stderr()
        .command(['pack', '--config', nonObjectPackConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonObjectPackConfig} --quiet] suppresses error message when cavy pack config content is not a JSON object`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy pack config: ValidationError: "commands" is required')
        )
        .it(`[--config ${missingPackCommandsConfig}] prints error message when cavy pack commands config is missing`);

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingPackCommandsConfig} --quiet] suppresses error message when cavy pack commands config is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', nonArrayPackCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy pack config: ValidationError: "commands" must be an array')
        )
        .it(
          `[--config ${nonArrayPackCommandsConfig}] prints error message when cavy pack commands config is not a JSON array`
        );

      test
        .stderr()
        .command(['pack', '--config', nonArrayPackCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonArrayPackCommandsConfig} --quiet] suppresses error message when cavy pack commands config is not a JSON array`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyPackCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands" does not contain 1 required value(s)'
          )
        )
        .it(
          `[--config ${emptyPackCommandsConfig}] prints error message when cavy pack commands config is empty JSON array`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyPackCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyPackCommandsConfig} --quiet] suppresses error message when cavy pack commands config is empty JSON array`
        );

      test
        .stderr()
        .command(['pack', '--config', nonObjectPackCommandConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0]" must be of type object'
          )
        )
        .it(
          `[--config ${nonObjectPackCommandConfig}] prints error message when a given cavy pack command config is not JSON object`
        );

      test
        .stderr()
        .command(['pack', '--config', nonObjectPackCommandConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonObjectPackCommandConfig} --quiet] suppresses error message when a given cavy pack command config is not JSON object`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy pack config: ValidationError: "commands[0].name" is required')
        )
        .it(
          `[--config ${missingPackCommandNameConfig}] prints error message when a given cavy pack command name field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingPackCommandNameConfig} --quiet] suppresses error message when a given cavy pack command name field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', nonStringPackCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].name" must be a string'
          )
        )
        .it(
          `[--config ${nonStringPackCommandNameConfig}] prints error message when a given cavy pack command name field is not a string`
        );

      test
        .stderr()
        .command(['pack', '--config', nonStringPackCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringPackCommandNameConfig} --quiet] suppresses error message when a given cavy pack command name field is not a string`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyStringPackCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].name" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringPackCommandNameConfig}] prints error message when a given cavy pack command name field is an empty string`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyStringPackCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringPackCommandNameConfig} --quiet] suppresses error message when a given cavy pack command name field is an empty string`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandSrcConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy pack config: ValidationError: "commands[0].src" is required')
        )
        .it(
          `[--config ${missingPackCommandSrcConfig}] prints error message when a given cavy pack command src field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandSrcConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingPackCommandSrcConfig} --quiet] suppresses error message when a given cavy pack command src field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', nonStringPackCommandSrcConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].src" must be a string'
          )
        )
        .it(
          `[--config ${nonStringPackCommandSrcConfig}] prints error message when a given cavy pack command src field is not a string`
        );

      test
        .stderr()
        .command(['pack', '--config', nonStringPackCommandSrcConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringPackCommandSrcConfig} --quiet] suppresses error message when a given cavy pack command src field is not a string`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyStringPackCommandSrcConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].src" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringPackCommandSrcConfig}] prints error message when a given cavy pack command src field is an empty string`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyStringPackCommandSrcConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringPackCommandSrcConfig} --quiet] suppresses error message when a given cavy pack command src field is an empty string`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandDstConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy pack config: ValidationError: "commands[0].dst" is required')
        )
        .it(
          `[--config ${missingPackCommandDstConfig}] prints error message when a given cavy pack command dst field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandDstConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingPackCommandDstConfig} --quiet] suppresses error message when a given cavy pack command dst field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', nonStringPackCommandDstConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].dst" must be a string'
          )
        )
        .it(
          `[--config ${nonStringPackCommandDstConfig}] prints error message when a given cavy pack command dst field is not a string`
        );

      test
        .stderr()
        .command(['pack', '--config', nonStringPackCommandDstConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringPackCommandDstConfig} --quiet] suppresses error message when a given cavy pack command dst field is not a string`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyStringPackCommandDstConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].dst" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringPackCommandDstConfig}] prints error message when a given cavy pack command dst field is an empty string`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyStringPackCommandDstConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringPackCommandDstConfig} --quiet] suppresses error message when a given cavy pack command dst field is an empty string`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandDevPostfixConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].devPostfix" is required'
          )
        )
        .it(
          `[--config ${missingPackCommandDevPostfixConfig}] prints error message when a given cavy pack command devPostfix field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandDevPostfixConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingPackCommandDevPostfixConfig} --quiet] suppresses error message when a given cavy pack command devPostfix field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', nonStringPackCommandDevPostfixConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].devPostfix" must be a string'
          )
        )
        .it(
          `[--config ${nonStringPackCommandDevPostfixConfig}] prints error message when a given cavy pack command devPostfix field is not a string`
        );

      test
        .stderr()
        .command(['pack', '--config', nonStringPackCommandDevPostfixConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringPackCommandDevPostfixConfig} --quiet] suppresses error message when a given cavy pack command devPostfix field is not a string`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyStringPackCommandDevPostfixConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].devPostfix" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringPackCommandDevPostfixConfig}] prints error message when a given cavy pack command devPostfix field is an empty string`
        );

      test
        .stderr()
        .command(['pack', '--config', emptyStringPackCommandDevPostfixConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringPackCommandDevPostfixConfig} --quiet] suppresses error message when a given cavy pack command devPostfix field is an empty string`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandPostUpdateConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].postUpdate" is required'
          )
        )
        .it(
          `[--config ${missingPackCommandPostUpdateConfig}] prints error message when a given cavy pack command postUpdate field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', missingPackCommandPostUpdateConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingPackCommandPostUpdateConfig} --quiet] suppresses error message when a given cavy pack command postUpdate field is missing`
        );

      test
        .stderr()
        .command(['pack', '--config', nonArrayPackCommandPostUpdateConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy pack config: ValidationError: "commands[0].postUpdate" must be an array'
          )
        )
        .it(
          `[--config ${nonArrayPackCommandPostUpdateConfig}] prints error message when a given cavy pack command postUpdate field is not an array`
        );

      test
        .stderr()
        .command(['pack', '--config', nonArrayPackCommandPostUpdateConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonArrayPackCommandPostUpdateConfig} --quiet] suppresses error message when a given cavy pack command redact field is not an array`
        );
    });

    //////////////////////////////////////////////////////////////////////////
    /// input
    //////////////////////////////////////////////////////////////////////////

    describe('input', () => {
      test
        .stderr()
        .command(['pack', '--config', packConfig])
        .catch((ctx) => {
          expect(ctx.message).to.contain('No pack commands were specified');
          expect(ctx.message).to.contain('--all required');
        })
        .it(`[--config ${packConfig}] prints error message when no arguments or options provided`);

      test
        .stderr()
        .command(['pack', '--config', packConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(`[--config ${packConfig} --quiet] suppresses error message when no arguments or options provided`);

      test
        .stderr()
        .command(['pack', '--config', packConfig, 'test-config', '--all'])
        .catch((ctx) => {
          expect(ctx.message).to.contain('Commands were specified for pack');
          expect(ctx.message).to.contain('--all invalid');
        })
        .it(`[--config ${packConfig} test --all] prints error message when arguments & --all option provided`);

      test
        .stderr()
        .command(['pack', '--config', packConfig, 'test-config', '--all', '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(
          `[--config ${packConfig} test --all --quiet] suppresses error message when arguments & --all option provided`
        );

      test
        .stderr()
        .command(['pack', '--config', packConfig, 'failit'])
        .catch((ctx) => expect(ctx.message).to.contain('Commands not found in cavy pack config: failit'))
        .it(`[--config ${packConfig} failit] prints error message when unknown command argument provided`);

      test
        .stderr()
        .command(['pack', '--config', packConfig, 'failit', '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(`[--config ${packConfig} failit --quiet] suppresses error message when unknown command argument provided`);
    });
  });
});
