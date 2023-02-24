import { ElementStates } from 'types/element-states'

import type { FC } from 'react'

import barStyles from './bar.module.css'

export interface IBarProps {
  value: number
  state: ElementStates
}

export const Bar: FC<IBarProps> = ({ value, state }) => {
  return (
    <div>
      <div
        style={{
          backgroundColor: `var(--${state}-color)`,
          height: `${3.4 * value}px`,
          width: '50px',
        }}
      ></div>
      <p>{value}</p>
    </div>
  )
}
