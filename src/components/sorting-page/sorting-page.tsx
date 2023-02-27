import { useCallback, useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import algos, { randomArr } from 'helpers/sorting'

import { Column } from 'components/ui/column/column'
import { Button } from 'components/ui/button/button'
import { RadioInput } from 'components/ui/radio-input/radio-input'
import { SolutionLayout } from '../ui/solution-layout/solution-layout'

import { DELAY_IN_MS } from 'constants/delays'

import { Direction } from 'types/direction'
import { ElementStates } from 'types/element-states'
import { SortingTypes } from 'types/sorting-types'
import type { FC, MouseEventHandler, FormEventHandler } from 'react'

import styles from './sorting.module.css'

interface ColumnProps {
  value: number
  state: ElementStates
}

export const SortingPage: FC<{}> = () => {
  const [state, setState] = useState<ColumnProps[]>([])
  const [step, setStep] = useState<number>(0)
  const [inProgress, setProgress] = useState<boolean>(false)
  const [sortingAlgo, setAlgo] = useState<SortingTypes>()
  const [sortingDirection, setDirection] = useState<Direction>()

  const numbersRef = useRef<ColumnProps[]>([])
  const timerRef = useRef<unknown>()
  const generatorRef = useRef<Generator>()

  const newArray = useCallback<() => void>(() => {
    numbersRef.current = randomArr().map(e => ({
      value: e,
      state: ElementStates.Default,
    }))
    setState(numbersRef.current)
  }, [setState])

  const submitHandler = useCallback<FormEventHandler>(
    e => {
      e.preventDefault()
      if (!sortingAlgo) return
      if (!sortingDirection) return
      setProgress(true)
      generatorRef.current = algos[sortingAlgo]<ColumnProps>(
        numbersRef,
        sortingDirection,
      )
      timerRef.current = setInterval(() => {
        setStep(step => step + 1)
      }, DELAY_IN_MS)
    },
    [sortingAlgo, sortingDirection],
  )

  useEffect(() => {
    newArray()
    return () => clearInterval(timerRef.current as number)
  }, [newArray])

  useEffect(() => {
    if (!generatorRef.current) return
    const yilded = generatorRef.current?.next()
    if (yilded?.done) {
      clearInterval(timerRef.current as number)
      setProgress(false)
      setDirection(undefined)
    } else {
      setState(yilded?.value as ColumnProps[])
    }
  }, [step])

  const onClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    e => setDirection(e.currentTarget.value as Direction),
    [],
  )

  const onRadio = useCallback<MouseEventHandler<HTMLInputElement>>(
    e => setAlgo(e.currentTarget.value as SortingTypes),
    [],
  )

  return (
    <SolutionLayout
      title='Сортировка массива'
      extraClass={styles.main}
    >
      <form
        className={styles.form}
        onSubmit={submitHandler}
      >
        <RadioInput
          label='Выбор'
          name='sort'
          onChange={onRadio}
          disabled={inProgress}
          value={SortingTypes.Selection}
          extraClass='mr-15'
        />
        <RadioInput
          label='Пузырёк'
          name='sort'
          onChange={onRadio}
          value={SortingTypes.Bubble}
          disabled={inProgress}
          extraClass='mr-15'
        />
        <Button
          type='submit'
          text='По возрастанию'
          sorting={Direction.Ascending}
          disabled={inProgress && sortingDirection !== Direction.Ascending}
          isLoader={inProgress && sortingDirection === Direction.Ascending}
          onClick={onClick}
          value={Direction.Ascending}
          extraClass='mr-8'
        />
        <Button
          type='submit'
          text='По убыванию'
          sorting={Direction.Descending}
          disabled={inProgress && sortingDirection !== Direction.Descending}
          isLoader={inProgress && sortingDirection === Direction.Descending}
          onClick={onClick}
          value={Direction.Descending}
          extraClass='mr-30'
        />
        <Button
          type='button'
          text='New array'
          onClick={newArray}
          disabled={inProgress}
        />
      </form>
      <div className={styles.container}>
        {state.map(({ value, state }) => (
          <Column
            key={uuid()}
            index={value}
            state={state}
          />
        ))}
      </div>
    </SolutionLayout>
  )
}
