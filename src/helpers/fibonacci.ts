import type { MutableRefObject, Dispatch, SetStateAction } from 'react'

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
