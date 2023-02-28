import { useCallback, useState } from 'react'

import type { Dispatch, SetStateAction, ChangeEventHandler } from 'react'

export const useInput = (
  initialValue?: string,
): {
  value: string
  handleChange: ChangeEventHandler<HTMLInputElement>
  setValue: Dispatch<SetStateAction<string>>
} => {
  const [value, setValue] = useState(initialValue ?? '')

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      e.preventDefault()
      setValue(e.target.value)
    },
    [setValue],
  )

  return { value, handleChange, setValue }
}
