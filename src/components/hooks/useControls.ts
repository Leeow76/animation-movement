import { KeysPressed } from '../objects/types'
import { useEffect, useState } from 'react'
import { useKeyPress } from 'react-use'
import useKeyboardJs from 'react-use/lib/useKeyboardJs'

export const useControls = () => {
  const [forward] = useKeyPress('w')
  const [forwardLeft] = useKeyboardJs('w + a')
  const [forwardRight] = useKeyboardJs('w + d')
  const [backward] = useKeyPress('s')
  const [backwardLeft] = useKeyboardJs('s + a')
  const [backwardRight] = useKeyboardJs('s + d')
  const [left] = useKeyPress('a')
  const [right] = useKeyPress('d')
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
  })

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
    const anyKeyPressed = Object.values(keysPressed).some(
      (value) => value === true
    )

    setAnyKeyPressed(anyKeyPressed)
  }, [keysPressed])

  return {
    keysPressed,
    anyKeyPressed,
  }
}
