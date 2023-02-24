import { useCallback, useState, useRef, MouseEventHandler } from 'react'
import { useInput } from 'hooks'
import { v4 as uuid } from 'uuid'
import { Stack } from 'helpers/stack'

import { Input } from 'components/ui/input/input'
import { Circle } from 'components/ui/circle/circle'
import { SolutionLayout } from '../ui/solution-layout/solution-layout'
import { Button } from 'components/ui/button/button'

import { SHORT_DELAY_IN_MS } from 'constants/delays'

import { ElementStates } from 'types/element-states'
import { Action } from 'types/action'
import type { FC, FormEventHandler } from 'react'

import styles from './stack.module.css'

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
      setAction(Action.Add)
      if (value.length === 0) return
      stack.current.push(value)
      setValue('')
      setState(
        stack.current.container.map((e, idx) => ({
          value: e,
          state: idx === len ? ElementStates.Changing : ElementStates.Default,
        })),
      )
      setTimeout(() => {
        setState(state =>
          state.map(e => ({ ...e, state: ElementStates.Default })),
        )
        setAction(undefined)
      }, SHORT_DELAY_IN_MS)
    },
    [setValue, stack, value, len],
  )

  const resetHandler = useCallback<FormEventHandler>(
    e => {
      e.preventDefault()
      stack.current.clear()
      setState(
        stack.current.container.map(e => ({
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
    setAction(Action.Remove)
    setState(state =>
      state.map((e, idx) => ({
        ...e,
        state: idx === len - 1 ? ElementStates.Changing : ElementStates.Default,
      })),
    )
    stack.current.pop()
    setTimeout(() => {
      setState(
        stack.current.container.map(e => ({
          value: e,
          state: ElementStates.Default,
        })),
      )
      setAction(undefined)
    }, SHORT_DELAY_IN_MS)
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
          extraClass={`mr-10 ${styles.input}`}
          isLimitText={true}
        />
        <Button
          type='submit'
          text='Добавить'
          isLoader={action === Action.Add}
          disabled={action === Action.Remove}
          extraClass='mr-10'
        />
        <Button
          type='button'
          text='Удалить'
          isLoader={action === Action.Remove}
          disabled={action === Action.Add}
          onClick={deleteHandler}
          extraClass='mr-30'
        />
        <Button
          type='reset'
          text='Очистить'
          disabled={!!action}
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
