import { swap } from 'helpers'

import { ElementStates } from 'types/element-states'
import type { MutableRefObject, Dispatch, SetStateAction } from 'react'

export const stringIteration = <
  T extends { state: ElementStates; value: string },
>(
  charsRef: MutableRefObject<T[]>,
  leftRef: MutableRefObject<number>,
  rightRef: MutableRefObject<number>,
  setter: Dispatch<SetStateAction<T[] | undefined>>,
) => {
  swap(charsRef.current, leftRef.current, rightRef.current)
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
