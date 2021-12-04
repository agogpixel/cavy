import { enumKeys, enumValues } from '../../src/utils/enum';

enum TestEnum {
  Alpha = 0,
  Beta = 'beta',
  Gamma = 'gamma',
  Omega = 3,
  Zeta = 99
}

describe('enum', () => {
  describe('enumKeys', () =>
    it('returns string array of enum keys', () =>
      expect(enumKeys(TestEnum)).toEqual(['Alpha', 'Beta', 'Gamma', 'Omega', 'Zeta'])));

  describe('enumValues', () =>
    it('returns array of enum values', () => expect(enumValues(TestEnum)).toEqual([0, 'beta', 'gamma', 3, 99])));
});
