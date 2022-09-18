import React, { useEffect, useState } from "react"
import { useAnimations, useGLTF } from "@react-three/drei"

type Animation =
  "idle" |
  "run_forward" |
  "run_left" |
  "run_right" |
  "t_pose" |
  "turn_left_180" |
  "turn_left_90" |
  "turn_right_180" |
  "turn_right_90" |
  "walk_forward" |
  "walk_left" |
  "walk_right"

const Player = () => {
  const [animation, setAnimation] = useState<Animation>('idle')
  const { scene, animations } = useGLTF("/assets/models/player.glb")
  const { ref, actions, names } = useAnimations(animations)

  // Change animation when the index changes
  useEffect(() => {
    // Reset and fade in animation after an index has been changed
    actions[animation]?.reset().fadeIn(0.5).play()
    // In the clean-up phase, fade it out
    return () => {
      actions[animation]?.fadeOut(0.5)
    }
  }, [animation, actions, names])

  return (
    <primitive rotation={[0, Math.PI, 0]} ref={ref} object={scene} />

  )
}

export default Player
