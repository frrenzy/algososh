import { useEffect, useRef, useState } from 'react'
import { useInput } from 'hooks'
import { Button } from '../ui/button/button'
import { Circle } from '../ui/circle/circle'
import { Input } from '../ui/input/input'
import { SolutionLayout } from '../ui/solution-layout/solution-layout'
import { v4 as uuid } from 'uuid'

import { DELAY_IN_MS } from 'constants/delays'

import { ElementStates } from 'types/element-states'
import type {
  FC,
  MutableRefObject,
  Dispatch,
  SetStateAction,
  FormEventHandler,
} from 'react'

import styles from './string.module.css'

interface Char {
  value: string
  state: ElementStates
}

const swap = <T extends { value: string }>(
  arr: T[],
  a: number,
  b: number,
): void => {
  const temp = arr[a].value
  arr[a].value = arr[b].value
  arr[b].value = temp
}

const iteration = (
  charsRef: MutableRefObject<Char[]>,
  leftRef: MutableRefObject<number>,
  rightRef: MutableRefObject<number>,
  setter: Dispatch<SetStateAction<Char[] | undefined>>,
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

export const StringComponent: FC = () => {
  const { value, handleChange } = useInput('')

  const [inProgress, setProgress] = useState(false)
  const [state, setState] = useState<Char[]>()
  const [step, setStep] = useState<number>(0)

  const charsRef = useRef<Char[]>([])
  const counterRef = useRef<number>(0)
  const timerRef = useRef<unknown>()
  const leftRef = useRef<number>(0)
  const rightRef = useRef<number>(0)

  useEffect(() => {
    if (counterRef.current === 0) {
      clearInterval(timerRef.current as number)
      setProgress(false)
    } else {
      iteration(charsRef, leftRef, rightRef, setState)
    }
  }, [step])

  const submitHandler: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    setProgress(true)
    const charsArray = Array.from(value).map(
      (char, idx) =>
        ({
          value: char,
          state:
            idx % (value.length - 1) === 0 //first and last are changing first
              ? ElementStates.Changing
              : ElementStates.Default,
        } as Char),
    )
    setState(charsArray)
    charsRef.current = charsArray
    counterRef.current = Math.ceil(charsArray.length / 2)
    leftRef.current = 0
    setStep(counterRef.current)
    rightRef.current = charsArray.length - 1
    timerRef.current = setInterval(() => {
      counterRef.current -= 1
      setStep(step => step + 1)
    }, DELAY_IN_MS)
  }

  return (
    <SolutionLayout
      title='Строка'
      extraClass={styles.main}
    >
      <form
        className={styles.form}
        onSubmit={submitHandler}
      >
        <Input
          value={value}
          onChange={handleChange}
          maxLength={11}
          isLimitText={true}
          extraClass={`mr-6 ${styles.input}`}
        />
        <Button
          text='Развернуть'
          type='submit'
          isLoader={inProgress}
        />
      </form>
      <div className={styles.container}>
        {state &&
          state.map(char => (
            <Circle
              key={uuid()}
              letter={char.value}
              state={char.state}
            />
          ))}
      </div>
    </SolutionLayout>
  )
}
