import { curry } from '../fp';
import { isIterableOrEmpty } from './isIterableOrEmpty';

export const skip = curry(function*(amt: number = 1, iterable: Iterable<any>) {
  const iter = isIterableOrEmpty(iterable)[Symbol.iterator]();
  let isDone = false;
  for (let i = 0; i < amt && !isDone; ++i) {
    isDone = iter.next().done;
  }
  if (isDone) return;
  while (true) {
    const { done, value } = iter.next();
    if (done) return;
    yield value;
  }
});
