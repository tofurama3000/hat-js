/**
 * Huet Zipper
 * @module immutable:Zipper
 */

// tree = Item | Iter(tree)
// path = Top | {left: Iter(tree), up: path, right: Iter(tree))}
// location = [tree, path]
import { emptyList, nestedToList, isList, toArrayNested } from '../list/index';
import { curry } from '../../fp/curry';
import { entries } from '../../obj/entries';
import { List, IList } from '../list/__list-sym';

const Top = Symbol('top');

export type ZipperData<T> = {
  path:
    | {
        left: List<T>;
        up: List<T>;
        right: List<T>;
      }
    | typeof Top;
  tree: any;
};

export interface IZipper<T> extends ZipperData<T> {
  change(e: T): IZipper<T>;
  canMoveLeft(): boolean;
  canMoveRight(): boolean;
  canMoveUp(): boolean;
  canMoveDown(): boolean;
  delete(): IZipper<T>;
  endOfDFS(): boolean;
  insertRight(e: T | T[]): IZipper<T>;
  insertLeft(e: T | T[]): IZipper<T>;
  insertDown(e: T | T[]): IZipper<T>;
  leftmost(): IZipper<T>;
  moveRight(): IZipper<T>;
  moveLeft(): IZipper<T>;
  moveDown(): IZipper<T>;
  moveUp(): IZipper<T>;
  next(): IZipper<T>;
  node(): T;
  nodeRaw(): any;
  rightmost(): IZipper<T>;
  root(): IZipper<T>;
  toArray(): T[];
  finished: boolean;
}

/**
 * Creates a new zipper from an iterable
 * Note: This will duplicate all nested iterables and convert them to immutable lists!
 *
 * @param {Iterable<any>} iterable to turn into a Huet Zipper
 * @returns {HuetZipper} A huet zipper
 */
export function createZipper<T>(iterable: Iterable<T>): IZipper<T> {
  return addZipperFuncs({
    tree: nestedToList(iterable, false),
    path: Top
  });
}

/**
 * Returns whether or not you can move left from a node
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {boolean} Whether or not you can move
 */
export function canMoveLeft({ path }) {
  return path !== Top && !path.left.isEmpty();
}

/**
 * Moves left in a huet zipper
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} A zipper that represents the result
 */
export function moveLeft<T>({ tree, path }): IZipper<T> {
  if (!canMoveLeft({ path })) {
    throw 'Cannot move left';
  }
  return addZipperFuncs({
    tree: path.left.first(),
    path: {
      left: path.left.rest(),
      up: path.up,
      right: path.right.add(tree)
    }
  });
}

/**
 * Moves to the leftmost position at the current level in a huet zipper
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} The leftmost position
 */
export function leftmost<T>(zipper: IZipper<T>): IZipper<T> {
  let currentZipper = zipper;
  while (currentZipper.canMoveLeft()) {
    currentZipper = currentZipper.moveLeft();
  }
  return currentZipper;
}

/**
 * Returns whether or not you can move right from a node
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {boolean} Whether or not you can move
 */
export function canMoveRight<T>({ path }: ZipperData<T>) {
  return path !== Top && !path.right.isEmpty();
}

/**
 * Moves right in a huet zipper
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} A zipper that represents the result
 */
export function moveRight<T>({ tree, path }: ZipperData<T>) {
  if (!canMoveRight({ tree, path }) || path === Top) {
    throw 'Cannot move right';
  }
  return addZipperFuncs({
    tree: path.right.first(),
    path: {
      left: path.left.add(tree),
      up: path.up,
      right: path.right.rest()
    }
  });
}

/**
 * Moves to the root (top) position in a huet zipper
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} The top position
 */
export function root<T>(zipper: IZipper<T>): IZipper<T> {
  let currentZipper = zipper;
  while (currentZipper.canMoveUp()) {
    currentZipper = currentZipper.moveUp();
  }
  return currentZipper;
}

/**
 * Moves to the rightmost position at the current level in a huet zipper
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} The rightmost position
 */
export function rightmost<T>(zipper: IZipper<T>): IZipper<T> {
  let currentZipper = zipper;
  while (currentZipper.canMoveRight()) {
    currentZipper = currentZipper.moveRight();
  }
  return currentZipper;
}

/**
 * Returns whether or not you can move up from a node
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {boolean} Whether or not you can move
 */
export function canMoveUp<T>({ path }: ZipperData<T>) {
  return path !== Top;
}

/**
 * Moves up in a huet zipper
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} A zipper that represents the result
 */
export function moveUp<T>({ tree, path }: ZipperData<T>): IZipper<T> {
  if (!canMoveUp({ tree, path }) || path === Top) {
    throw 'Cannot move up';
  }
  return addZipperFuncs({
    tree: (path.left as IList<T>).reverse().concat(path.right.add(tree)),
    path: path.up
  });
}

/**
 * Returns whether or not you can move down from a node
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {boolean} Whether or not you can move
 */
export function canMoveDown<T>({ tree }: ZipperData<T>) {
  return isList(tree) && !tree.isEmpty();
}

/**
 * Moves down in a huet zipper
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} A zipper that represents the result
 */
export function moveDown<T>({ tree, path }: ZipperData<T>): IZipper<T> {
  if (!canMoveDown({ tree, path })) {
    throw 'Cannot move down';
  }

  return addZipperFuncs({
    tree: tree.first(),
    path: {
      left: emptyList(),
      up: path,
      right: tree.rest()
    }
  });
}

/**
 * Changes the current element in the huet zipper
 *
 * @autocurry
 * @kind function
 * @param {any} newElem Element to replace the current element with
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} A zipper that represents the result
 */
export const change = curry(
  <T>(newElem: T, { path }: ZipperData<T>): IZipper<T> => addZipperFuncs({ tree: newElem, path })
);

/**
 * Inserts element to the right
 *
 * @autocurry
 * @kind function
 * @param {any} newElem Element to insert
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} A zipper that represents the result
 */
export const insertRight = curry(
  <T>(newElem: T, { tree, path }: ZipperData<T>): IZipper<T> => {
    if (path === Top) {
      throw 'Cannot insert at top';
    }
    return addZipperFuncs({
      tree,
      path: { ...path, right: path.right.add(nestedToList(newElem)) }
    });
  }
);

/**
 * Inserts element to the left
 *
 * @autocurry
 * @kind function
 * @param {any} newElem Element to insert
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} A zipper that represents the result
 */
export const insertLeft = curry(
  <T>(newElem: T, { tree, path }: ZipperData<T>): IZipper<T> => {
    if (path === Top) {
      throw 'Cannot insert at top';
    }
    return addZipperFuncs({ tree, path: { ...path, left: nestedToList(path.left.add(newElem)) } });
  }
);

/**
 * Inserts element below the current element if the current element is a list
 *
 * @autocurry
 * @kind function
 * @param {any} newElem Element to insert
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} A zipper that represents the result
 */
export const insertDown = curry(
  <T>(newElem: T, { tree, path }: ZipperData<T>): IZipper<T> => {
    if (!isList(tree)) {
      throw 'Cannot insert below an element';
    }
    return addZipperFuncs({
      tree: nestedToList(newElem),
      path: { left: emptyList(), path, right: tree }
    });
  }
);

/**
 * Deletes the node from the zipper
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {HuetZipper} The zipper with the current element removed
 */
export function deleteNode<T>({ path }: ZipperData<T>): IZipper<T> {
  if (path === Top) {
    throw 'Cannot delete top of tree';
  }
  if (!path.right.isEmpty()) {
    return addZipperFuncs({
      tree: path.right.first(),
      path: {
        ...path,
        right: path.right.rest()
      }
    });
  } else if (!path.left.isEmpty()) {
    return addZipperFuncs({
      tree: path.left.first(),
      path: {
        ...path,
        left: path.left.rest()
      }
    });
  } else {
    return addZipperFuncs({
      tree: [],
      path: path.up
    });
  }
}

/**
 * Returns the node for the current element in the zipper (will convert a list to an array)
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {any[] | any} The current element
 */
export function node<T>({ tree }: ZipperData<T>): T | T[] {
  return toArrayNested(tree);
}

/**
 * Returns the node for the current element in the zipper without transformations
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {List | any} The current element
 */
export function nodeRaw<T>({ tree }: ZipperData<T>): T | List<T> {
  return tree;
}

/**
 * Returns the next element in the tree for a DFS traversal
 * @param {HuetZipper} zipper The zipper to operate navigate
 * @returns {HuetZipper} The next element
 */
export function next<T>(zipper: IZipper<T>): IZipper<T> {
  const addNotFinished = e => {
    e.finished = false;
    return e;
  };

  if (zipper.canMoveDown()) {
    return addNotFinished(zipper.moveDown());
  } else if (zipper.canMoveRight()) {
    return addNotFinished(zipper.moveRight());
  } else {
    let currentZipper = zipper;
    while (currentZipper.canMoveUp()) {
      currentZipper = currentZipper.moveUp();
      if (currentZipper.canMoveRight()) {
        return addNotFinished(currentZipper.moveRight());
      }
    }
    currentZipper.finished = true;
    return currentZipper;
  }
}

/**
 * Returns the current tree and it's sub elements as an array
 * @param {HuetZipper} zipper The zipper to operate on
 * @returns {any[]} The tree represented with arrays
 */
export function toArray<T>({ tree }: ZipperData<T>): any[] {
  if (isList(tree)) {
    return toArrayNested(tree);
  }
  return tree;
}

/**
 * Returns whether or not a zipper is at the end of a DFS walk
 * @param {HuetZipper} zipper The zipper to check
 * @returns {boolean} Whether or not it is the end of a DFS walk
 */
export function endOfDFS<T>({ finished }: IZipper<T>) {
  return finished;
}

const bind = zipper => ([name, func]) => {
  zipper[name] = (...args) => func(...args, zipper);
};

function addZipperFuncs<T>(zipper): IZipper<T> {
  entries({
    change,
    canMoveLeft,
    canMoveRight,
    canMoveUp,
    canMoveDown,
    delete: deleteNode,
    endOfDFS,
    insertRight,
    insertLeft,
    insertDown,
    leftmost,
    moveRight,
    moveLeft,
    moveDown,
    moveUp,
    next,
    node,
    nodeRaw,
    rightmost,
    root,
    toArray
  }).forEach(bind(zipper));
  return zipper;
}
