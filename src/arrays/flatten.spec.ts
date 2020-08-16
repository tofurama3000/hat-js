import { flatten } from './flatten';

describe('flatten', () => {
  it('works on arrays', () => {
    expect(flatten([[1, 2, 3, 4], [5, 6, 7], [8], 9])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });
});
