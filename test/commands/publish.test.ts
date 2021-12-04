// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="../typings.d.ts" />

//import { expect, test } from '@oclif/test';
import { mkdir, rm } from 'shelljs';

//const testResourcesPath = `${TEST_RESOURCES_PATH}/commands/publish`;
const testTmpPath = `${TEST_TMP_PATH}/commands/publish`;
//const quietExitMessage = QUIET_EXIT_MESSAGE;

const tmpDistPath = `${testTmpPath}/dist`;

describe('Publish', () => {
  // Squelch console output.
  jest.spyOn(console, 'log').mockImplementation(() => undefined);
  jest.spyOn(console, 'warn').mockImplementation(() => undefined);
  jest.spyOn(console, 'error').mockImplementation(() => undefined);

  describe('usage', () => {
    beforeEach(() => mkdir('-p', tmpDistPath));

    afterAll(() => rm('-rf', testTmpPath));

    it.todo('todo');
  });

  describe('error handling', () => {
    it.todo('todo');

    //////////////////////////////////////////////////////////////////////////
    /// config
    //////////////////////////////////////////////////////////////////////////

    describe('config', () => {
      it.todo('todo');
    });

    //////////////////////////////////////////////////////////////////////////
    /// input
    //////////////////////////////////////////////////////////////////////////

    describe('input', () => {
      it.todo('todo');
    });
  });
});
