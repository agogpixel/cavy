import { BaseError } from '../../src/errors/base-error';

describe('BaseError', () => {
  it('is extendable & throwable', () => {
    const slug = 'test';

    class TestError extends BaseError {
      name = slug;
      code = slug;
      suggestions = [slug];
      ref = slug;
    }

    let sentinal = true;

    try {
      throw new TestError(slug);
      sentinal = false;
    } catch (e) {
      const { name, code, suggestions, ref, message } = e as TestError;
      expect(name).toEqual(slug);
      expect(code).toEqual(slug);
      expect(suggestions).toEqual([slug]);
      expect(ref).toEqual(slug);
      expect(message).toEqual(slug);
    }

    expect(sentinal).toEqual(true);
  });
});
