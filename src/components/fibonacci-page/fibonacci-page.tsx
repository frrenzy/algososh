import { useEffect, useRef, useState } from 'react'
import { useInput } from 'hooks'
import { v4 as uuid } from 'uuid'

import { SolutionLayout } from '../ui/solution-layout/solution-layout'
import { Circle } from '../ui/circle/circle'
import { Button } from '../ui/button/button'
import { Input } from 'components/ui/input/input'

import { SHORT_DELAY_IN_MS } from 'constants/delays'

import type {
  FC,
  FormEventHandler,
  MutableRefObject,
  SetStateAction,
  Dispatch,
} from 'react'

import styles from './fibonacci.module.css'

const iteration = (
  index: number,
  cache: MutableRefObject<number[]>,
  setter: Dispatch<SetStateAction<number[]>>,
) => {
  console.log(index)
  if (index >= cache.current.length) {
    cache.current.push(cache.current[index - 1] + cache.current[index - 2])
  }
  setter(state => [...state, cache.current[index]])
}

export const FibonacciPage: FC = () => {
  const { value, handleChange } = useInput('')

  const [inProgress, setProgress] = useState<boolean>(false)
  const [state, setState] = useState<number[]>([])
  const [step, setStep] = useState<number>(0)

  const numbersRef = useRef<number[]>([])
  const counterRef = useRef<number>(0)
  const timerRef = useRef<unknown>()
  const memoRef = useRef<number[]>([1, 1])

  useEffect(() => {
    if (counterRef.current === 0) {
      clearInterval(timerRef.current as number)
      setProgress(false)
    } else {
      iteration(step!, memoRef, setState)
    }
  }, [step])

  const submitHandler: FormEventHandler<HTMLFormElement> = e => {
    e.preventDefault()
    setProgress(true)
    setStep(0)
    setState([])
    numbersRef.current = []
    counterRef.current = parseInt(value) + 1
    timerRef.current = setInterval(() => {
      counterRef.current -= 1
      setStep(step => step + 1)
    }, SHORT_DELAY_IN_MS)
  }

  return (
    <SolutionLayout
      title='Последовательность Фибоначчи'
      extraClass={styles.main}
    >
      <form
        className={styles.form}
        onSubmit={submitHandler}
      >
        <Input
          value={value}
          onChange={handleChange}
          type='number'
          max={19}
          isLimitText={true}
          extraClass={`mr-6 ${styles.input}`}
        />
        <Button
          text='Рассчитать'
          type='submit'
          isLoader={inProgress}
        />
      </form>
      <div
        className={`${styles.container} ${state.length > 10 && styles.tenPlus}`}
      >
        {state &&
          state.map((element, idx) => (
            <Circle
              key={uuid()}
              letter={element.toString()}
              index={idx}
            />
          ))}
      </div>
    </SolutionLayout>
  )
}
