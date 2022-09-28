import { useEffect, useState } from 'react'
import { useKeyPress } from 'react-use'

export const useControls = () => {
  const [forward] = useKeyPress('w')
  const [backward] = useKeyPress('s')
  const [left] = useKeyPress('a')
  const [right] = useKeyPress('d')
  const [keyPressed, setKeyPressed] = useState(false)

  useEffect(() => {
    right || left || forward || backward ? setKeyPressed(true) : setKeyPressed(false)
  }, [forward, left, right, backward])

  return [
    forward,
    backward,
    left,
    right,
    keyPressed
  ]
}
