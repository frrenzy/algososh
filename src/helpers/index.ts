export const swap = <T extends { value: number | string }>(
  arr: T[],
  a: number,
  b: number,
): void => {
  const temp = arr[a].value
  arr[a].value = arr[b].value
  arr[b].value = temp
}

export class Node<T> {
  value: T
  next: Node<T> | null
  constructor(value: T, next?: Node<T> | null) {
    this.value = value
    this.next = next === undefined ? null : next
  }
}
