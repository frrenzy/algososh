export class Stack<T> {
  container: T[] = []

  push = (item: T): void => {
    this.container.push(item)
  }

  pop = (): void => {
    this.container.pop()
  }

  getSize = (): number => this.container.length

  clear = (): void => {
    this.container = []
  }
}
