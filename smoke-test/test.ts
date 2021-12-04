import { execSync } from 'child_process';

describe('Cavy', () =>
  it('prints help', () => expect(execSync("bash -c './node_modules/.bin/cavy --help'").toString()).toContain('USAGE')));
