// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../typings.d.ts" />

import { expect, test } from '@oclif/test';

const testResourcesPath = `${TEST_RESOURCES_PATH}/commands/lint`;
const quietExitMessage = QUIET_EXIT_MESSAGE;

const missingLintConfig = `${testResourcesPath}/missing-lint-config.json`;
const nonObjectLintConfig = `${testResourcesPath}/non-object-lint-config.json`;

const missingLintCommandsConfig = `${testResourcesPath}/missing-lint-commands-config.json`;
const nonArrayLintCommandsConfig = `${testResourcesPath}/non-array-lint-commands-config.json`;
const emptyLintCommandsConfig = `${testResourcesPath}/empty-lint-commands-config.json`;

const nonObjectLintCommandConfig = `${testResourcesPath}/non-object-lint-command-config.json`;

const missingLintCommandNameConfig = `${testResourcesPath}/missing-lint-command-name-config.json`;
const nonStringLintCommandNameConfig = `${testResourcesPath}/non-string-lint-command-name-config.json`;
const emptyStringLintCommandNameConfig = `${testResourcesPath}/empty-string-lint-command-name-config.json`;

const missingLintCommandTestConfig = `${testResourcesPath}/missing-lint-command-test-config.json`;
const nonStringLintCommandTestConfig = `${testResourcesPath}/non-string-lint-command-test-config.json`;
const emptyStringLintCommandTestConfig = `${testResourcesPath}/empty-string-lint-command-test-config.json`;

const missingLintCommandFixConfig = `${testResourcesPath}/missing-lint-command-fix-config.json`;
const nonStringLintCommandFixConfig = `${testResourcesPath}/non-string-lint-command-fix-config.json`;
const emptyStringLintCommandFixConfig = `${testResourcesPath}/empty-string-lint-command-fix-config.json`;

const missingLintCommandTargetsConfig = `${testResourcesPath}/missing-lint-command-targets-config.json`;
const nonArrayLintCommandTargetsConfig = `${testResourcesPath}/non-array-lint-command-targets-config.json`;

const nonStringLintCommandTargetConfig = `${testResourcesPath}/non-string-lint-command-target-config.json`;
const emptyStringLintCommandTargetConfig = `${testResourcesPath}/empty-string-lint-command-target-config.json`;

const lintConfig = `${testResourcesPath}/lint-config.json`;
const lintErrorConfig = `${testResourcesPath}/lint-error-config.json`;

describe('Lint', () => {
  // Squelch console output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  describe('usage', () => {
    test
      .stdout()
      .command(['lint', '--config', lintConfig, '--all'])
      .it(`[--config ${lintConfig} --all] runs all configured commands`, (ctx) => {
        expect(ctx.stdout).to.contain('test-config: echo test-command');
        expect(ctx.stdout).to.contain('test-config2: echo test-command2');
      });

    test
      .stdout()
      .command(['lint', '--config', lintConfig, '--all', '--fix'])
      .it(`[--config ${lintConfig} --all --fix] runs all configured commands with fix`, (ctx) => {
        expect(ctx.stdout).to.contain('test-config: echo fix-command');
        expect(ctx.stdout).to.contain('test-config2: echo fix-command2');
      });

    test
      .stdout()
      .command(['lint', '--config', lintConfig, '--all', '--quiet'])
      .it(`[--config ${lintConfig} --all --quiet] runs all configured commands with output suppressed`, (ctx) =>
        expect(ctx.stdout.trim()).to.equal('')
      );

    test
      .stdout()
      .command(['lint', '--config', lintConfig, '--all', '--verbose'])
      .it(`[--config ${lintConfig} --all --verbose] runs all configured commands with verbose output`, (ctx) => {
        expect(ctx.stdout).to.contain('Available commands: test-config, test-config2');
        expect(ctx.stdout).to.contain('Specified commands: test-config, test-config2');
      });

    test
      .stdout()
      .command(['lint', '--config', lintConfig, 'test-config'])
      .it(`[--config ${lintConfig} test-config] runs specified command`, (ctx) => {
        expect(ctx.stdout).to.contain('test-config: echo test-command');
        expect(ctx.stdout).to.not.contain('test-config2: echo test-command2');
      });

    test
      .stdout()
      .command(['lint', '--config', lintConfig, 'test-config', '--fix'])
      .it(`[--config ${lintConfig} test-config --fix] runs specified command with fix`, (ctx) => {
        expect(ctx.stdout).to.contain('test-config: echo fix-command');
        expect(ctx.stdout).to.not.contain('test-config2: echo fix-command2');
      });

    test
      .stdout()
      .command(['lint', '--config', lintConfig, 'test-config', '--quiet'])
      .it(`[--config ${lintConfig} test-config --quiet] runs specified command with output suppressed`, (ctx) =>
        expect(ctx.stdout.trim()).to.equal('')
      );

    test
      .stdout()
      .command(['lint', '--config', lintConfig, 'test-config', '--verbose'])
      .it(`[--config ${lintConfig} test-config --verbose] runs specified command with verbose output`, (ctx) => {
        expect(ctx.stdout).to.contain('Available commands: test-config, test-config2');
        expect(ctx.stdout).to.contain('Specified commands: test-config');
      });
  });

  describe('error handling', () => {
    test
      .stderr()
      .command(['lint', '--config', lintErrorConfig, '--all'])
      .catch((ctx) => expect(ctx.message).to.contain('Lint had failure(s)'))
      .it(`[--config ${lintErrorConfig} --all] runs all configured commands and reports error(s)`);

    test
      .stderr()
      .command(['lint', '--config', lintErrorConfig, '--all', '--quiet'])
      .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
      .it(`[--config ${lintErrorConfig} --all --quiet] runs all configured commands and suppresses error(s)`);

    //////////////////////////////////////////////////////////////////////////
    /// config
    //////////////////////////////////////////////////////////////////////////

    describe('config', () => {
      test
        .stderr()
        .command(['lint', '--config', missingLintConfig])
        .catch((ctx) => expect(ctx.message).to.contain('Cavy lint config required'))
        .it(`[--config ${missingLintConfig}] prints error message when cavy lint config is missing`);

      test
        .stderr()
        .command(['lint', '--config', missingLintConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(`[--config ${missingLintConfig} --quiet] suppresses error message when cavy lint config is missing`);

      test
        .stderr()
        .command(['lint', '--config', nonObjectLintConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy lint config: ValidationError: "value" must be of type object')
        )
        .it(
          `[--config ${nonObjectLintConfig}] prints error message when cavy lint config content is not a JSON object`
        );

      test
        .stderr()
        .command(['lint', '--config', nonObjectLintConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonObjectLintConfig} --quiet] suppresses error message when cavy lint config content is not a JSON object`
        );

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy lint config: ValidationError: "commands" is required')
        )
        .it(`[--config ${missingLintCommandsConfig}] prints error message when cavy lint commands are missing`);

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingLintCommandsConfig} --quiet] suppresses error message when cavy lint commands are missing`
        );

      test
        .stderr()
        .command(['lint', '--config', nonArrayLintCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy lint config: ValidationError: "commands" must be an array')
        )
        .it(
          `[--config ${nonArrayLintCommandsConfig}] prints error message when cavy lint commands config is not a JSON array`
        );

      test
        .stderr()
        .command(['lint', '--config', nonArrayLintCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonArrayLintCommandsConfig} --quiet] suppresses error message when cavy lint commands config is not a JSON array`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyLintCommandsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands" does not contain 1 required value(s)'
          )
        )
        .it(
          `[--config ${emptyLintCommandsConfig}] prints error message when cavy lint commands config is empty JSON array`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyLintCommandsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyLintCommandsConfig} --quiet] suppresses error message when cavy lint commands config is empty JSON array`
        );

      test
        .stderr()
        .command(['lint', '--config', nonObjectLintCommandConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0]" must be of type object'
          )
        )
        .it(
          `[--config ${nonObjectLintCommandConfig}] prints error message when a given cavy lint command config is not JSON object`
        );

      test
        .stderr()
        .command(['lint', '--config', nonObjectLintCommandConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonObjectLintCommandConfig} --quiet] suppresses error message when a given cavy lint command config is not JSON object`
        );

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy lint config: ValidationError: "commands[0].name" is required')
        )
        .it(
          `[--config ${missingLintCommandNameConfig}] prints error message when a given cavy lint command name field is missing`
        );

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingLintCommandNameConfig} --quiet] suppresses error message when a given cavy lint command name field is missing`
        );

      test
        .stderr()
        .command(['lint', '--config', nonStringLintCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0].name" must be a string'
          )
        )
        .it(
          `[--config ${nonStringLintCommandNameConfig}] prints error message when a given cavy lint command name field is not a string`
        );

      test
        .stderr()
        .command(['lint', '--config', nonStringLintCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringLintCommandNameConfig} --quiet] suppresses error message when a given cavy lint command name field is not a string`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyStringLintCommandNameConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0].name" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringLintCommandNameConfig}] prints error message when a given cavy lint command name field is an empty string`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyStringLintCommandNameConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringLintCommandNameConfig} --quiet] suppresses error message when a given cavy lint command name field is an empty string`
        );

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandTestConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy lint config: ValidationError: "commands[0].test" is required')
        )
        .it(
          `[--config ${missingLintCommandTestConfig}] prints error message when a given cavy lint command test field is missing`
        );

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandTestConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingLintCommandTestConfig} --quiet] suppresses error message when a given cavy lint command test field is missing`
        );

      test
        .stderr()
        .command(['lint', '--config', nonStringLintCommandTestConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0].test" must be a string'
          )
        )
        .it(
          `[--config ${nonStringLintCommandTestConfig}] prints error message when a given cavy lint command test field is not a string`
        );

      test
        .stderr()
        .command(['lint', '--config', nonStringLintCommandTestConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringLintCommandTestConfig} --quiet] suppresses error message when a given cavy lint command test field is not a string`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyStringLintCommandTestConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0].test" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringLintCommandTestConfig}] prints error message when a given cavy lint command test field is an empty string`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyStringLintCommandTestConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringLintCommandTestConfig} --quiet] suppresses error message when a given cavy lint command test field is an empty string`
        );

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandFixConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy lint config: ValidationError: "commands[0].fix" is required')
        )
        .it(
          `[--config ${missingLintCommandFixConfig}] prints error message when a given cavy lint command fix field is missing`
        );

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandFixConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingLintCommandFixConfig} --quiet] suppresses error message when a given cavy lint command fix field is missing`
        );

      test
        .stderr()
        .command(['lint', '--config', nonStringLintCommandFixConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0].fix" must be a string'
          )
        )
        .it(
          `[--config ${nonStringLintCommandFixConfig}] prints error message when a given cavy lint command fix field is not a string`
        );

      test
        .stderr()
        .command(['lint', '--config', nonStringLintCommandFixConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringLintCommandFixConfig} --quiet] suppresses error message when a given cavy lint command fix field is not a string`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyStringLintCommandFixConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0].fix" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringLintCommandFixConfig}] prints error message when a given cavy lint command fix field is an empty string`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyStringLintCommandFixConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringLintCommandFixConfig} --quiet] suppresses error message when a given cavy lint command fix field is an empty string`
        );

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandTargetsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain('Invalid cavy lint config: ValidationError: "commands[0].targets" is required')
        )
        .it(
          `[--config ${missingLintCommandTargetsConfig}] prints error message when a given cavy lint command targets field is missing`
        );

      test
        .stderr()
        .command(['lint', '--config', missingLintCommandTargetsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${missingLintCommandTargetsConfig} --quiet] suppresses error message when a given cavy lint command targets field is missing`
        );

      test
        .stderr()
        .command(['lint', '--config', nonArrayLintCommandTargetsConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0].targets" must be an array'
          )
        )
        .it(
          `[--config ${nonArrayLintCommandTargetsConfig}] prints error message when a given cavy lint command targets field is not an array`
        );

      test
        .stderr()
        .command(['lint', '--config', nonArrayLintCommandTargetsConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonArrayLintCommandTargetsConfig} --quiet] suppresses error message when a given cavy lint command targets field is not an array`
        );

      test
        .stderr()
        .command(['lint', '--config', nonStringLintCommandTargetConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0].targets[0]" must be a string'
          )
        )
        .it(
          `[--config ${nonStringLintCommandTargetConfig}] prints error message when a given cavy lint command target is not a string`
        );

      test
        .stderr()
        .command(['lint', '--config', nonStringLintCommandTargetConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${nonStringLintCommandTargetConfig} --quiet] suppresses error message when a given cavy lint command target is not a string`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyStringLintCommandTargetConfig])
        .catch((ctx) =>
          expect(ctx.message).to.contain(
            'Invalid cavy lint config: ValidationError: "commands[0].targets[0]" is not allowed to be empty'
          )
        )
        .it(
          `[--config ${emptyStringLintCommandTargetConfig}] prints error message when a given cavy lint command target is an empty string`
        );

      test
        .stderr()
        .command(['lint', '--config', emptyStringLintCommandTargetConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message.trim()).to.equal(quietExitMessage))
        .it(
          `[--config ${emptyStringLintCommandTargetConfig} --quiet] suppresses error message when a given cavy lint command target is an empty string`
        );
    });

    //////////////////////////////////////////////////////////////////////////
    /// input
    //////////////////////////////////////////////////////////////////////////

    describe('input', () => {
      test
        .stderr()
        .command(['lint', '--config', lintConfig])
        .catch((ctx) => {
          expect(ctx.message).to.contain('No lint commands were specified');
          expect(ctx.message).to.contain('--all required');
        })
        .it(`[--config ${lintConfig}] prints error message when no arguments or options provided`);

      test
        .stderr()
        .command(['lint', '--config', lintConfig, '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(`[--config ${lintConfig} --quiet] suppresses error message when no arguments or options provided`);

      test
        .stderr()
        .command(['lint', '--config', lintConfig, 'test-config', '--all'])
        .catch((ctx) => {
          expect(ctx.message).to.contain('Commands were specified for lint');
          expect(ctx.message).to.contain('--all invalid');
        })
        .it(`[--config ${lintConfig} test-config --all] prints error message when arguments & --all option provided`);

      test
        .stderr()
        .command(['lint', '--config', lintConfig, 'test-config', '--all', '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(
          `[--config ${lintConfig} test-config --all --quiet] suppresses error message when arguments & --all option provided`
        );

      test
        .stderr()
        .command(['lint', '--config', lintConfig, 'failit'])
        .catch((ctx) => expect(ctx.message).to.contain('Commands not found in cavy lint config: failit'))
        .it(`[--config ${lintConfig} failit] prints error message when unknown command argument provided`);

      test
        .stderr()
        .command(['lint', '--config', lintConfig, 'failit', '--quiet'])
        .catch((ctx) => expect(ctx.message).to.contain(quietExitMessage))
        .it(`[--config ${lintConfig} failit --quiet] suppresses error message when unknown command argument provided`);
    });
  });
});
