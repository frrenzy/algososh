import { useCallback, useState, useRef } from 'react'
import { useInput } from 'hooks'
import { v4 as uuid } from 'uuid'
import { Queue } from 'helpers/queue'

import { Input } from 'components/ui/input/input'
import { Circle } from 'components/ui/circle/circle'
import { SolutionLayout } from '../ui/solution-layout/solution-layout'
import { Button } from 'components/ui/button/button'

import { SHORT_DELAY_IN_MS } from 'constants/delays'

import { ElementStates } from 'types/element-states'
import { Action } from 'types/action'
import type { FC, FormEventHandler, MouseEventHandler } from 'react'

import styles from './queue.module.css'

interface Item {
  value: string
  state: ElementStates
}

export const QueuePage: FC<{}> = () => {
  const { value, handleChange, setValue } = useInput('')

  const [action, setAction] = useState<Action>()
  const queue = useRef<Queue<string>>(new Queue<string>(6))
  const [state, setState] = useState<Item[]>(
    Array(6).fill({ value: '', state: ElementStates.Default }),
  )

  const head = queue.current.head
  const tail = queue.current.tail
  const length = queue.current.length

  const submitHandler = useCallback<FormEventHandler>(
    e => {
      e.preventDefault()
      setAction(Action.Add)
      if (value.length === 0) return
      queue.current.enqueue(value)
      setValue('')
      setState(
        queue.current.container.map((e, idx) => ({
          value: e ?? '',
          state:
            idx === (tail + 1) % 6
              ? ElementStates.Changing
              : ElementStates.Default,
        })),
      )
      setTimeout(() => {
        setState(state =>
          state.map(e => ({ ...e, state: ElementStates.Default })),
        )
        setAction(undefined)
      }, SHORT_DELAY_IN_MS)
    },
    [setValue, queue, value, tail],
  )

  const resetHandler = useCallback<FormEventHandler>(
    e => {
      e.preventDefault()
      queue.current.clear()
      setState(
        queue.current.container.map(e => ({
          value: e ?? '',
          state: ElementStates.Default,
        })),
      )
    },
    [queue],
  )

  const deleteHandler = useCallback<
    MouseEventHandler<HTMLButtonElement>
  >(() => {
    setAction(Action.Remove)
    setState(state =>
      state.map((e, idx) => ({
        ...e,
        state:
          idx === head % 6 ? ElementStates.Changing : ElementStates.Default,
      })),
    )
    queue.current.dequeue()
    setTimeout(() => {
      setState(
        queue.current.container.map(e => ({
          value: e ?? '',
          state: ElementStates.Default,
        })),
      )
      setAction(undefined)
    }, SHORT_DELAY_IN_MS)
  }, [head])

  return (
    <SolutionLayout
      title='Очередь'
      extraClass={styles.main}
    >
      <form
        className={styles.form}
        onSubmit={submitHandler}
        onReset={resetHandler}
      >
        <Input
          type='text'
          maxLength={4}
          value={value}
          onChange={handleChange}
          extraClass={`mr-10 ${styles.input}`}
          isLimitText={true}
        />
        <Button
          type='submit'
          text='Добавить'
          isLoader={action === Action.Add}
          disabled={
            action === Action.Remove || length === 6 || value.length === 0
          }
          extraClass='mr-10'
        />
        <Button
          type='button'
          text='Удалить'
          isLoader={action === Action.Remove}
          disabled={action === Action.Add || length === 0}
          onClick={deleteHandler}
          extraClass='mr-30'
        />
        <Button
          type='reset'
          text='Очистить'
          disabled={!!action || length === 0}
        />
      </form>
      <div className={styles.container}>
        {state.map(({ value, state }, idx) => (
          <Circle
            key={uuid()}
            letter={value}
            state={state}
            index={idx}
            head={idx === head % 6 ? 'head' : null}
            tail={idx === tail % 6 ? 'tail' : null}
          />
        ))}
      </div>
    </SolutionLayout>
  )
}
