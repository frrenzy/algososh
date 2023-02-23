import { ChangeEventHandler, useCallback, useState } from 'react'

export const useInput = (
  initialValue?: string,
): { value: string; handleChange: ChangeEventHandler<HTMLInputElement> } => {
  const [value, setValue] = useState(initialValue ?? '')

  const handleChange = useCallback<ChangeEventHandler<HTMLInputElement>>(
    e => {
      e.preventDefault()
      setValue(e.target.value)
    },
    [setValue],
  )

  return { value, handleChange }
}
