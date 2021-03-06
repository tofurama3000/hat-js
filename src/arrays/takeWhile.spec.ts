import { takeWhile } from './takeWhile';

describe('takeWhile', () => {
  it('will take while a function returns true', () => {
    const fn = (() => {
      let i = 0;
      return () => {
        if (i++ < 3) return true;
        return false;
      };
    })();

    expect(takeWhile(fn, [1, 2, 3, 4, 5])).toEqual([1, 2, 3]);
    expect(takeWhile(fn, [])).toEqual([]);
    expect(takeWhile(_ => true, [1, 2, 3, 4, 5])).toEqual([1, 2, 3, 4, 5]);
  });
});
