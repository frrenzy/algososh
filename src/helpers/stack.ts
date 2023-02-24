export class Stack<T> {
  container: T[] = []

  push = (item: T): void => {
    this.container.push(item)
  }

  pop = (): void => {
    this.container.pop()
  }

  peak = (): T | null => {
    return this.getSize() > 0 ? this.container[this.getSize() - 1] : null
  }

  getSize = (): number => this.container.length

  clear = (): void => {
    this.container = []
  }
}
