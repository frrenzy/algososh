export class Queue<T> {
  container: (T | null)[] = []
  head: number = 0
  tail: number = -1
  size: number = 0
  length: number = 0

  constructor(size: number) {
    this.size = size
    this.container = Array(size).fill('')
  }

  enqueue = (item: T): void => {
    if (this.length >= this.size) throw new Error('Maximum queue size exceeded')

    this.tail = this.tail + 1
    this.container[this.tail % this.size] = item
    this.length++
  }

  dequeue = (): void => {
    if (this.isEmpty()) throw new Error('Queue is empty')

    this.container[this.head % this.size] = null
    this.head++
    this.length--
  }

  isEmpty = (): boolean => this.length === 0

  clear = (): void => {
    this.container = Array(this.size).fill('')
    this.head = 0
    this.tail = -1
    this.length = 0
  }
}
