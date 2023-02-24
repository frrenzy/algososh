import { useCallback, useEffect, useRef, useState } from 'react'
import { useInput } from 'hooks'
import { v4 as uuid } from 'uuid'
import { stringIteration as iteration } from 'helpers/string'

import { Button } from '../ui/button/button'
import { Circle } from '../ui/circle/circle'
import { Input } from '../ui/input/input'
import { SolutionLayout } from '../ui/solution-layout/solution-layout'

import { DELAY_IN_MS } from 'constants/delays'

import { ElementStates } from 'types/element-states'
import type { FC, FormEventHandler } from 'react'

import styles from './string.module.css'

interface Char {
  value: string
  state: ElementStates
}

export const StringComponent: FC<{}> = () => {
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

  useEffect(() => {
    return () => clearInterval(timerRef.current as number)
  }, [])

  const submitHandler = useCallback<FormEventHandler<HTMLFormElement>>(
    e => {
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
    },
    [value],
  )

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
          state.map(({ value, state }) => (
            <Circle
              key={uuid()}
              letter={value}
              state={state}
            />
          ))}
      </div>
    </SolutionLayout>
  )
}
