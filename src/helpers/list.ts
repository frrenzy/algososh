import { ElementStates } from 'types/element-states'
import { Node } from 'helpers'
import { MutableRefObject } from 'react'
import { Action } from 'types/action'
import { PointerType } from 'types/pointer-types'

interface CircleItem {
  letter: string
  state: ElementStates
}

type PointerElement = string | CircleItem | null

export interface Item {
  letter: string
  state: ElementStates
  head: PointerElement
  tail: PointerElement
}

export const isCircle = (p: PointerElement): p is CircleItem => {
  return p !== null && p.hasOwnProperty('letter')
}

export class LinkedList<T> {
  head: Node<T> | null = null
  tail: Node<T> | null = null
  length: number = 0

  constructor(...args: T[]) {
    args.forEach(this.push)
  }

  push = (value: T): void => {
    if (!this.head) {
      this.tail = this.head = new Node<T>(value)
    } else {
      this.tail = new Node<T>(value, null, this.tail)
      this.tail.prev!.next = this.tail
    }

    this.length++
  }

  unshift = (value: T): void => {
    if (!this.head) {
      this.tail = this.head = new Node<T>(value)
    } else {
      this.head = new Node(value, this.head, null)
      this.head.next!.prev = this.head
    }

    this.length++
  }

  insertAt = (value: T, index: number): void => {
    if (index < 0 || index > this.length)
      throw new Error('List index out of range')

    if (index === 0) {
      this.unshift(value)
    } else if (index === this.length) {
      this.push(value)
    } else {
      let curr = this.head
      for (let i = 0; i < index - 1; i++) {
        curr = curr!.next
      }

      const newNode = new Node(value, curr!.next, curr)
      curr!.next = newNode
      newNode.next!.prev = newNode
    }

    this.length++
  }

  pop = (): T => {
    if (this.length === 0) throw new Error('List is empty')

    const value = this.tail!.value

    if (this.length === 1) {
      this.head = null
      this.tail = null
    } else {
      this.tail = this.tail!.prev
      this.tail!.next = null
    }
    this.length--
    return value
  }

  shift = (): T | null => {
    if (this.length === 0) throw new Error('List is empty')

    const value = this.head!.value

    if (this.length === 1) {
      this.head = null
      this.tail = null
    } else {
      this.head = this.head!.next
      this.head!.prev = null
    }
    this.length--
    return value
  }

  removeAt = (index: number): T | null => {
    if (index < 0 || index >= this.length)
      throw new Error('List index out of range')

    if (index === 0) return this.shift()
    if (index === this.length - 1) return this.pop()

    let curr = this.head
    for (let i = 0; i < index; i++) {
      curr = curr!.next
    }
    curr!.prev!.next = curr!.next
    curr!.next!.prev = curr!.prev
    this.length--
    return curr!.value
  }

  traverse = (): T[] => {
    let curr = this.head
    let arr: T[] = []
    while (curr) {
      arr.push(curr.value)
      curr = curr.next
    }
    return arr
  }
}

export const initialState: Item[] = [
  { letter: '0', state: ElementStates.Default, head: null, tail: null },
  { letter: '1', state: ElementStates.Default, head: null, tail: null },
  { letter: '2', state: ElementStates.Default, head: null, tail: null },
]

export type Algo = (
  listRef: MutableRefObject<LinkedList<Item>>,
  value?: string,
  index?: number,
) => Generator<Item[], Item[], unknown>

const pushGen: Algo = function* (listRef, value) {
  const item = {
    letter: value!,
    state: ElementStates.Modified,
    head: null,
    tail: null,
  }
  if (listRef.current.tail) {
    listRef.current.tail.value.head = {
      letter: value!,
      state: ElementStates.Changing,
    }
    yield listRef.current.traverse()
    listRef.current.tail.value.head = null
  }

  listRef.current.push(item)
  yield listRef.current.traverse()
  listRef.current.tail!.value.state = ElementStates.Default
  return listRef.current.traverse()
}

const unshiftGen: Algo = function* (listRef, value) {
  const item = {
    letter: value!,
    state: ElementStates.Modified,
    head: null,
    tail: null,
  }
  if (listRef.current.head) {
    listRef.current.head.value.head = {
      letter: value!,
      state: ElementStates.Changing,
    }
    yield listRef.current.traverse()
    listRef.current.head.value.head = null
  }

  listRef.current.unshift(item)
  yield listRef.current.traverse()
  listRef.current.head!.value.state = ElementStates.Default
  return listRef.current.traverse()
}

const popGen: Algo = function* (listRef) {
  listRef.current.tail!.value.tail = {
    letter: listRef.current.tail!.value.letter,
    state: ElementStates.Changing,
  }
  listRef.current.tail!.value.letter = ''
  yield listRef.current.traverse()
  listRef.current.pop()
  return listRef.current.traverse()
}

const shiftGen: Algo = function* (listRef) {
  listRef.current.head!.value.tail = {
    letter: listRef.current.head!.value.letter,
    state: ElementStates.Changing,
  }
  listRef.current.head!.value.letter = ''
  yield listRef.current.traverse()
  listRef.current.shift()
  return listRef.current.traverse()
}

const insertAtGen: Algo = function* (listRef, value, index) {
  const newNode: CircleItem = { letter: value!, state: ElementStates.Changing }
  let curr = listRef.current.head
  for (let i = 0; i <= index!; i++) {
    curr!.value.state = ElementStates.Changing
    curr!.value.head = newNode
    yield listRef.current.traverse()
    curr!.value.head = null
    curr = curr!.next ?? curr
  }

  curr!.value.head = null
  listRef.current.insertAt(
    { letter: value!, state: ElementStates.Modified, head: null, tail: null },
    index!,
  )
  yield listRef.current.traverse()

  curr = listRef.current.head
  for (let i = 0; i <= index! + 1; i++) {
    curr!.value.state = ElementStates.Default
    curr = curr!.next ?? curr
  }
  return listRef.current.traverse()
}

const removeAtGen: Algo = function* (listRef, value = undefined, index) {
  let curr = listRef.current.head
  for (let i = 0; i < index!; i++) {
    curr!.value.state = ElementStates.Changing
    yield listRef.current.traverse()
    curr = curr!.next ?? curr
  }

  curr!.value.state = ElementStates.Changing
  yield listRef.current.traverse()

  curr!.value.tail = {
    letter: curr!.value.letter,
    state: ElementStates.Changing,
  }
  curr!.value.letter = ''
  yield listRef.current.traverse()

  listRef.current.removeAt(index!)

  curr = listRef.current.head
  for (let i = 0; i < index!; i++) {
    curr!.value.state = ElementStates.Default
    curr = curr?.next ?? curr
  }
  return listRef.current.traverse()
}

export const algos: Record<Action, Record<PointerType, Algo>> = {
  [Action.Add]: {
    [PointerType.Tail]: pushGen,
    [PointerType.Head]: unshiftGen,
    [PointerType.Index]: insertAtGen,
  },
  [Action.Remove]: {
    [PointerType.Tail]: popGen,
    [PointerType.Head]: shiftGen,
    [PointerType.Index]: removeAtGen,
  },
}
