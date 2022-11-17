import { KeysPressed } from '../objects/types'
import { useEffect, useState } from 'react'
import useKeyboardJs from 'react-use/lib/useKeyboardJs'

export const useControls = () => {
  const [invalidDirection] = useKeyboardJs([
    'a + d',
    'w + s',
    'a + w + d',
    'a + s + d',
  ])
  const [forward] = useKeyboardJs('w')
  const [forwardLeft] = useKeyboardJs('w + a')
  const [forwardRight] = useKeyboardJs('w + d')
  const [backward] = useKeyboardJs('s')
  const [backwardLeft] = useKeyboardJs('s + a')
  const [backwardRight] = useKeyboardJs('s + d')
  const [left] = useKeyboardJs('a')
  const [right] = useKeyboardJs('d')
  const [shift] = useKeyboardJs('shift')
  const [shiftPressed, setShiftPressed] = useState(false)
  const [anyKeyPressed, setAnyKeyPressed] = useState(false)
  const [keysPressed, setKeysPressed] = useState<KeysPressed>({
    forward: false,
    forwardLeft: false,
    forwardRight: false,
    backward: false,
    backwardLeft: false,
    backwardRight: false,
    left: false,
    right: false,
    invalidDirection: false,
  })

  useEffect(() => {
    setKeysPressed((prevState) => ({
      ...prevState,
      invalidDirection,
    }))
  }, [invalidDirection])
  useEffect(() => {
    setKeysPressed((prevState) => ({
      ...prevState,
      forward,
    }))
  }, [forward])
  useEffect(() => {
    setKeysPressed((prevState) => ({
      ...prevState,
      forwardLeft,
    }))
  }, [forwardLeft])
  useEffect(() => {
    setKeysPressed((prevState) => ({
      ...prevState,
      forwardRight,
    }))
  }, [forwardRight])
  useEffect(() => {
    setKeysPressed((prevState) => ({
      ...prevState,
      backward,
    }))
  }, [backward])
  useEffect(() => {
    setKeysPressed((prevState) => ({
      ...prevState,
      backwardLeft,
    }))
  }, [backwardLeft])
  useEffect(() => {
    setKeysPressed((prevState) => ({
      ...prevState,
      backwardRight,
    }))
  }, [backwardRight])
  useEffect(() => {
    setKeysPressed((prevState) => ({
      ...prevState,
      left,
    }))
  }, [left])
  useEffect(() => {
    setKeysPressed((prevState) => ({
      ...prevState,
      right,
    }))
  }, [right])
  useEffect(() => {
    setShiftPressed(shift)
  }, [shift])

  useEffect(() => {
    const anyKeyPressed = Object.values(keysPressed).some(
      (value) => value === true
    )

    setAnyKeyPressed(anyKeyPressed)
  }, [keysPressed])

  return {
    keysPressed,
    shiftPressed,
    anyKeyPressed,
  }
}
