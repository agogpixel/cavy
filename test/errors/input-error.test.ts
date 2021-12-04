import { InputError } from '../../src/errors/input-error';

describe('InputError', () => {
  it('is throwable', () => {
    const slug = 'test';
    let sentinal = true;

    try {
      throw new InputError(slug);
      sentinal = false;
    } catch (e) {
      const { name, code, suggestions, ref, message } = e as InputError;
      expect(name).toEqual('Input Error');
      expect(code).toEqual(undefined);
      expect(suggestions).toEqual(['See more help with --help']);
      expect(ref).toEqual(undefined);
      expect(message).toEqual(slug);
    }

    expect(sentinal).toEqual(true);
  });
});
