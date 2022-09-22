import { AnimationName } from './types'
import { useAnimations, useGLTF } from '@react-three/drei'
import React, { useEffect, useLayoutEffect, useState } from 'react'
import * as THREE from 'three'

const Player = () => {
  const [animation, setAnimation] = useState<AnimationName>('run_forward')
  const { scene, animations } = useGLTF('/assets/models/player.glb')
  console.log(scene)
  const { ref, actions, names } = useAnimations(animations)

  useLayoutEffect(() => {
    scene.traverse(
      (obj) => (obj as THREE.Mesh).isMesh && (obj.castShadow = true)
    )
  })

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
    <>
      <primitive rotation={[0, Math.PI, 0]} ref={ref} object={scene} />
    </>
  )
}

export default Player
