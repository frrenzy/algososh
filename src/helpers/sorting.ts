import { swap } from 'helpers'

import { ElementStates } from 'types/element-states'
import { Direction } from 'types/direction'
import type { MutableRefObject } from 'react'

const sortingPredicate = (direction: Direction) => (a: number, b: number) => {
  return direction === Direction.Ascending ? a >= b : b >= a
}

function* bubbleSort<T extends { state: ElementStates; value: number }>(
  array: MutableRefObject<T[]>,
  direction: Direction,
) {
  const len = array.current.length
  const predicate = sortingPredicate(direction)
  array.current = array.current.map(e => ({
    ...e,
    state: ElementStates.Default,
  }))
  for (let i = 0; i < len; i++) {
    for (let j = 0; j < len - i - 1; j++) {
      array.current[j].state = ElementStates.Changing
      array.current[j + 1].state = ElementStates.Changing
      if (predicate(array.current[j].value, array.current[j + 1].value)) {
        swap<T>(array.current, j, j + 1)
      }
      yield array.current
      array.current[j].state = ElementStates.Default
    }
    array.current[len - i - 1].state = ElementStates.Modified
  }
}

function* selectionSort<T extends { value: number; state: ElementStates }>(
  array: MutableRefObject<T[]>,
  direction: Direction,
) {
  const predicate = sortingPredicate(direction)
  const len = array.current.length
  array.current = array.current.map(e => ({
    ...e,
    state: ElementStates.Default,
  }))
  for (let i = 0; i < len; i++) {
    let extrema = direction === Direction.Ascending ? -1 : 101
    let extremaIndex = 0
    array.current[len - i - 1].state = ElementStates.Changing
    for (let j = 0; j < len - i; j++) {
      array.current[j].state = ElementStates.Changing
      if (predicate(array.current[j].value, extrema)) {
        extremaIndex = j
        extrema = array.current[j].value
      }
      yield array.current
      array.current[j].state = ElementStates.Default
    }
    swap(array.current, extremaIndex, array.current.length - i - 1)
    array.current[len - i - 1].state = ElementStates.Modified
  }
}

export const randomArr = () => {
  const top = Math.ceil(3 + Math.random() * 14)
  const array: number[] = []
  for (let i = 0; i < top; i++) {
    array.push(Math.floor(100 * Math.random()))
  }
  return array
}

const algos = {
  bubbleSort,
  selectionSort,
}

export default algos
