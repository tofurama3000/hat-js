/**
 * @module iterables:removeTruthy
 * @ignore
 */
import { toIterableOrEmpty } from './toIterableOrEmpty';
import { filter } from './filter';

/**
 * Removes all truthy values from an iterable
 *
 * @param {Iterable<any>} iterable The iterable to iterate over
 * @returns {Iterable<any>} The resulting iterable
 */
export function removeTruthy<T>(iter: Iterable<T>): Iterable<T> {
  return filter(x => !x, toIterableOrEmpty(iter));
}
