/**
 * @param reason Failure reason.
 * @see https://github.com/facebook/jest/issues/11698
 */
function fail(reason = 'fail was called in a test.') {
  throw new Error(reason);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any)['fail'] = fail;
