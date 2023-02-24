import { useCallback, useState, useRef, MouseEventHandler } from 'react'
import { useInput } from 'hooks'
import { v4 as uuid } from 'uuid'
import { Stack } from 'helpers/stack'

import { Input } from 'components/ui/input/input'
import { Circle } from 'components/ui/circle/circle'
import { SolutionLayout } from '../ui/solution-layout/solution-layout'
import { Button } from 'components/ui/button/button'

import { ElementStates } from 'types/element-states'
import { Action } from 'types/action'

import styles from './stack.module.css'
import type { FC, FormEventHandler } from 'react'
import { SHORT_DELAY_IN_MS } from 'constants/delays'

interface Item {
  value: string
  state: ElementStates
}

export const StackPage: FC<{}> = () => {
  const { value, handleChange, setValue } = useInput('')

  const [action, setAction] = useState<Action>()
  const stack = useRef<Stack<string>>(new Stack<string>())
  const [state, setState] = useState<Item[]>([])

  const len = state.length

  const submitHandler = useCallback<FormEventHandler>(
    e => {
      e.preventDefault()
      if (value.length === 0) return
      stack.current.push(value)
      setValue('')
      setState(
        stack.current.container.map((e, idx) => ({
          value: e,
          state: idx === len ? ElementStates.Changing : ElementStates.Default,
        })),
      )
      setTimeout(
        () =>
          setState(state =>
            state.map(e => ({ ...e, state: ElementStates.Default })),
          ),
        SHORT_DELAY_IN_MS,
      )
    },
    [setValue, stack, value, len],
  )

  const resetHandler = useCallback<FormEventHandler>(
    e => {
      e.preventDefault()
      stack.current.clear()
      setState(
        stack.current.container.map((e, idx) => ({
          value: e,
          state: ElementStates.Default,
        })),
      )
    },
    [stack],
  )

  const deleteHandler = useCallback<
    MouseEventHandler<HTMLButtonElement>
  >(() => {
    setState(state =>
      state.map((e, idx) => ({
        ...e,
        state: idx === len - 1 ? ElementStates.Changing : ElementStates.Default,
      })),
    )
    stack.current.pop()
    setTimeout(
      () =>
        setState(
          stack.current.container.map(e => ({
            value: e,
            state: ElementStates.Default,
          })),
        ),
      SHORT_DELAY_IN_MS,
    )
  }, [len])

  return (
    <SolutionLayout
      title='Стек'
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
          extraClass={styles.input}
          isLimitText={true}
        />
        <Button
          type='submit'
          text='Добавить'
          isLoader={action === Action.Add}
        />
        <Button
          type='button'
          text='Удалить'
          isLoader={action === Action.Clear}
          onClick={deleteHandler}
        />
        <Button
          type='reset'
          text='Очистить'
          isLoader={action === Action.Remove}
        />
      </form>
      <div className={styles.container}>
        {state.map(({ value, state }, idx) => (
          <Circle
            key={uuid()}
            letter={value}
            state={state}
            index={idx}
            head={idx === len - 1 ? 'top' : null}
          />
        ))}
      </div>
    </SolutionLayout>
  )
}
