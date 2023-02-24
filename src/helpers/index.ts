import { Direction } from 'types/direction'
import { ElementStates } from 'types/element-states'

import type { MutableRefObject, Dispatch, SetStateAction } from 'react'

const sortingPredicate = (direction: Direction) => (a: number, b: number) => {
  return direction === Direction.Ascending ? a >= b : b >= a
}

const swap = <T extends { value: number | string }>(
  arr: T[],
  a: number,
  b: number,
): void => {
  const temp = arr[a].value
  arr[a].value = arr[b].value
  arr[b].value = temp
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

export const stringIteration = <
  T extends { state: ElementStates; value: string },
>(
  charsRef: MutableRefObject<T[]>,
  leftRef: MutableRefObject<number>,
  rightRef: MutableRefObject<number>,
  setter: Dispatch<SetStateAction<T[] | undefined>>,
) => {
  swap<T>(charsRef.current, leftRef.current, rightRef.current)
  charsRef.current[leftRef.current].state = ElementStates.Modified
  charsRef.current[rightRef.current].state = ElementStates.Modified
  leftRef.current += 1
  rightRef.current -= 1
  if (leftRef.current <= rightRef.current) {
    charsRef.current[leftRef.current].state = ElementStates.Changing
    charsRef.current[rightRef.current].state = ElementStates.Changing
  }
  setter(charsRef.current)
}

export const fibonacciIteration = (
  index: number,
  cache: MutableRefObject<number[]>,
  setter: Dispatch<SetStateAction<number[]>>,
) => {
  if (index >= cache.current.length) {
    cache.current.push(cache.current[index - 1] + cache.current[index - 2])
  }
  setter(state => [...state, cache.current[index]])
}

const algos = {
  bubbleSort,
  selectionSort,
}

export default algos
