import { useCallback, useState, useRef, Fragment, useEffect } from 'react'
import { Button } from 'components/ui/button/button'
import { Circle } from 'components/ui/circle/circle'
import { Input } from 'components/ui/input/input'
import { useInput } from 'hooks'
import { ElementStates } from 'types/element-states'
import { SolutionLayout } from '../ui/solution-layout/solution-layout'
import { Action } from 'types/action'
import { v4 as uuid } from 'uuid'
import { LinkedList } from 'helpers/list'

import type { FormEventHandler, MouseEventHandler } from 'react'
import type { Item, Algo } from 'helpers/list'

import styles from './list.module.css'
import { PointerType } from 'types/pointer-types'
import { algos, initialState, isCircle } from 'helpers/list'
import { DELAY_IN_MS } from 'constants/delays'
import { HEAD, TAIL } from 'constants/element-captions'

export const ListPage: React.FC = () => {
  const { value, handleChange: handleValueChange, setValue } = useInput('')
  const {
    value: index,
    handleChange: handleIndexChange,
    setValue: setIndex,
  } = useInput('')

  const [currentAction, setAction] = useState<{
    action: Action
    pointer: PointerType
  }>()
  const [step, setStep] = useState<number>(0)
  const [state, setState] = useState<Item[]>(initialState)

  const listRef = useRef<LinkedList<Item>>(
    new LinkedList<Item>(...initialState),
  )
  const timerRef = useRef<unknown>()
  const generatorRef = useRef<ReturnType<Algo>>()

  const isLoader = useCallback(
    (action: Action, pointer: PointerType) =>
      currentAction?.action === action && currentAction?.pointer === pointer,
    [currentAction?.action, currentAction?.pointer],
  )

  const isDisabled = useCallback(
    (action: Action, pointer: PointerType) =>
      !!currentAction && !isLoader(action, pointer),
    [currentAction, isLoader],
  )

  const clickHandler = useCallback(
    (
        action: Action,
        pointer: PointerType,
      ): MouseEventHandler<HTMLButtonElement> =>
      () =>
        setAction({ action, pointer }),
    [],
  )

  const submitHandler = useCallback<FormEventHandler>(
    e => {
      e.preventDefault()
      if (!currentAction) return

      generatorRef.current = algos[currentAction.action][currentAction.pointer](
        listRef,
        value,
        parseInt(index),
      )
      timerRef.current = setInterval(() => {
        setStep(step => step + 1)
      }, DELAY_IN_MS)
      setIndex('')
      setValue('')
    },
    [currentAction, setIndex, setValue, value, index],
  )

  useEffect(() => {
    if (!generatorRef.current) return
    const yilded = generatorRef.current?.next()
    setState(yilded?.value as Item[])
    if (yilded?.done) {
      clearInterval(timerRef.current as number)
      setAction(undefined)
    }
  }, [step])

  useEffect(() => () => clearInterval(timerRef.current as number), [])

  const len = state?.length ?? 0
  return (
    <SolutionLayout
      title='Связный список'
      extraClass={styles.main}
    >
      <form onSubmit={submitHandler}>
        <fieldset className={styles.fieldset}>
          <Input
            type='text'
            maxLength={4}
            isLimitText={true}
            value={value}
            onChange={handleValueChange}
            extraClass={`${styles.input} mr-6`}
            placeholder='Введите значение'
          />
          <Button
            type='submit'
            text='Добавить в head'
            extraClass='mr-6'
            linkedList='small'
            disabled={isDisabled(Action.Add, PointerType.Head)}
            isLoader={isLoader(Action.Add, PointerType.Head)}
            onClick={clickHandler(Action.Add, PointerType.Head)}
          />
          <Button
            type='submit'
            text='Добавить в tail'
            linkedList='small'
            extraClass='mr-6'
            disabled={isDisabled(Action.Add, PointerType.Tail)}
            isLoader={isLoader(Action.Add, PointerType.Tail)}
            onClick={clickHandler(Action.Add, PointerType.Tail)}
          />
          <Button
            type='submit'
            text='Удалить из head'
            extraClass='mr-6'
            linkedList='small'
            disabled={isDisabled(Action.Remove, PointerType.Head) || len === 0}
            isLoader={isLoader(Action.Remove, PointerType.Head)}
            onClick={clickHandler(Action.Remove, PointerType.Head)}
          />
          <Button
            type='submit'
            text='Удалить из tail'
            linkedList='small'
            disabled={isDisabled(Action.Remove, PointerType.Tail) || len === 0}
            isLoader={isLoader(Action.Remove, PointerType.Tail)}
            onClick={clickHandler(Action.Remove, PointerType.Tail)}
          />
        </fieldset>
        <fieldset className={styles.fieldset}>
          <Input
            type='text'
            extraClass={`${styles.inputBottom} mr-6`}
            value={index}
            onChange={handleIndexChange}
            placeholder='Введите индекс'
          />
          <Button
            type='submit'
            text='Добавить по индексу'
            extraClass='mr-6'
            linkedList='big'
            disabled={
              isDisabled(Action.Add, PointerType.Index) ||
              parseInt(index) > len ||
              parseInt(index) < 0
            }
            isLoader={isLoader(Action.Add, PointerType.Index)}
            onClick={clickHandler(Action.Add, PointerType.Index)}
          />
          <Button
            type='submit'
            text='Удалить по индексу'
            linkedList='big'
            disabled={
              isDisabled(Action.Remove, PointerType.Index) ||
              len === 0 ||
              parseInt(index) < 0 ||
              parseInt(index) >= len
            }
            isLoader={isLoader(Action.Remove, PointerType.Index)}
            onClick={clickHandler(Action.Remove, PointerType.Index)}
          />
        </fieldset>
      </form>
      <div className={styles.container}>
        {state &&
          state.map(({ letter, state, head, tail }, idx) => {
            let circleHead: React.ReactElement | string | null = null
            let circleTail: React.ReactElement | string | null = null
            if (isCircle(head)) {
              circleHead = (
                <Circle
                  {...head}
                  isSmall={true}
                />
              )
            } else if (typeof head === 'string') {
              circleHead = head
            } else if (idx === 0) {
              circleHead = HEAD
            }
            if (isCircle(tail)) {
              circleTail = (
                <Circle
                  {...tail}
                  isSmall={true}
                />
              )
            } else if (typeof tail === 'string') {
              circleTail = tail
            } else if (idx === len - 1) {
              circleTail = TAIL
            }
            return (
              <Fragment key={uuid()}>
                <Circle
                  letter={letter}
                  state={state}
                  head={circleHead}
                  tail={circleTail}
                  index={idx}
                />
                {idx !== len - 1 && (
                  <span
                    className='changing text_type_circle'
                    style={{ display: 'inline-block' }}
                  >
                    {'>'}
                  </span>
                )}
              </Fragment>
            )
          })}
      </div>
    </SolutionLayout>
  )
}
