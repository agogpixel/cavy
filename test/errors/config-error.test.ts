import { ConfigError } from '../../src/errors/config-error';

describe('ConfigError', () => {
  it('is throwable', () => {
    const slug = 'test';
    let sentinal = true;

    try {
      throw new ConfigError(slug);
      sentinal = false;
    } catch (e) {
      const { name, code, suggestions, ref, message } = e as ConfigError;
      expect(name).toEqual('Config Error');
      expect(code).toEqual(undefined);
      expect(suggestions).toEqual(undefined);
      expect(ref).toEqual(undefined);
      expect(message).toEqual(slug);
    }

    expect(sentinal).toEqual(true);
  });
});
