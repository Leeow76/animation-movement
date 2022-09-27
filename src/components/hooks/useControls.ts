import { useEffect, useState } from 'react'
import { useKeyPress } from 'react-use'

export const useControls = () => {
  const [forward] = useKeyPress('w')
  const [left] = useKeyPress('a')
  const [right] = useKeyPress('d')
  const [keyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    right || left || forward ? setKeyPressed(true) : setKeyPressed(false)
  }, [forward, left, right])

  return [forward, left, right, keyPressed]
}
