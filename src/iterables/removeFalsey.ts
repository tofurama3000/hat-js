/**
 * @module iterables:removeFalsey
 * @ignore
 */
import { toIterableOrEmpty } from './toIterableOrEmpty';
import { filter } from './filter';

/**
 * Removes all falsey values from an iterable
 *
 * @param {Iterable<any>} iterable The iterable to iterate over
 * @returns {Iterable<any>} The resulting iterable
 */
export function removeFalsey<T>(iterable: Iterable<T>): Iterable<T> {
  return filter(x => x, toIterableOrEmpty(iterable));
}
