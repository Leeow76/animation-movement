import {useFrame} from '@react-three/fiber'
import { useControls } from 'leva'
import React, {useEffect, useMemo, useRef} from 'react'
import * as THREE from 'three'
import {useStore} from '../../store'

const Lights = () => {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null)
  const playerRef = useRef(useStore.getState().player)
  const cameraOffset = useMemo(() => new THREE.Vector3(2.5, 4, 3), [])
  const {
    DIRECTIONAL_LIGHT_INTENSITY,
    AMBIENT_LIGHT_INTENSITY,
  } = useControls('Lights', {
    DIRECTIONAL_LIGHT_INTENSITY: { label: 'Directional light intensity', value: 1, min: 0, max: 5 },
    AMBIENT_LIGHT_INTENSITY: { label: 'Ambient light intensity', value: 0.5, min: 0, max: 3 },
  })

  useEffect(() => {
    useStore.subscribe(
      (state) => (
        playerRef.current = state.player
      )
    )
  }, [])

  useFrame(() => {
    if (directionalLightRef.current) {
      directionalLightRef.current.position.addVectors(playerRef.current.position, cameraOffset)
      directionalLightRef.current.target = playerRef.current
    }
  })

  return (
    <>
      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
      <directionalLight
        ref={directionalLightRef}
        castShadow
        intensity={DIRECTIONAL_LIGHT_INTENSITY}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={8}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
      />
    </>
  )
}

export default Lights
