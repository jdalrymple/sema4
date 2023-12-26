// Deque is based on https://github.com/petkaantonov/deque/blob/master/js/deque.js
// Released under the MIT License: https://github.com/petkaantonov/deque/blob/6ef4b6400ad3ba82853fdcc6531a38eb4f78c18c/LICENSE
/*eslint-disable*/
export const MIN_CAPACITY = 4;
export const MAX_CAPACITY = 1073741824;
export const RESIZE_MULTIPLER = 1;

export function arrayMove(
  list: any[],
  srcIndex: number,
  dstIndex: number,
  numberOfElements: number,
) {
  for (let j = 0; j < numberOfElements; ++j) {
    list[j + dstIndex] = list[j + srcIndex];
    list[j + srcIndex] = void 0;
  }
}

function pow2AtLeast(n: number) {
  n >>>= 0;
  n -= 1;
  n |= n >> 1;
  n |= n >> 2;
  n |= n >> 4;
  n |= n >> 8;
  n |= n >> 16;

  return n + 1;
}

export function getCapacity(capacity: number) {
  return pow2AtLeast(Math.min(Math.max(MIN_CAPACITY, capacity), MAX_CAPACITY));
}

/**
 * Resizes the buffer to a certain capacity.
 *
 * This function also makes the buffer contiguous,
 *
 * If the capacity is too small,
 * then it will automatically be scaled up to the length of the buffer.
 */
export function resizeTo<T>(list: Array<T | void>, capacity: number, backIndex: number) {
  // Resize
  if (backIndex <= capacity) return;

  const moveItemsCount = backIndex & (capacity - 1);

  arrayMove(list, 0, capacity, moveItemsCount);
}

export class Deque<T> {
  private _capacity: number;

  private _length: number;

  private _front: number;

  private arr: Array<T | void>;

  constructor(initialCapacity: number = 4) {
    this._capacity = getCapacity(initialCapacity);
    this._length = 0;
    this._front = 0;
    this.arr = [];
  }

  push(item: T): number {
    const backIndex = this._front + this._length;

    // Update capacity if needed
    if (this._capacity < this._length + 1) {
      const newCapacity = getCapacity(this._capacity * RESIZE_MULTIPLER + MIN_CAPACITY);

      resizeTo(this.arr, this._capacity, backIndex);

      this._capacity = newCapacity;
    }

    const i = backIndex & (this._capacity - 1);

    this.arr[i] = item;
    this._length += 1;

    return this._length;
  }

  pop(): T | void {
    const length = this._length;

    if (length === 0) return;

    const i = (this._front + length - 1) & (this._capacity - 1);
    const ret = this.arr[i];

    this.arr[i] = void 0;
    this._length = length - 1;

    return ret;
  }

  shift() {
    const length = this._length;

    if (length === 0) return;

    const front = this._front;
    const ret = this.arr[front];

    this.arr[front] = void 0;
    this._front = (front + 1) & (this._capacity - 1);
    this._length = length - 1;

    return ret;
  }

  get length(): number {
    return this._length;
  }
}
