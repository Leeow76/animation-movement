import { useStore } from '../../store'
import { Sky } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useControls } from 'leva'
import React, { useEffect, useRef } from 'react'
import * as THREE from 'three'

const Lights = () => {
  const directionalLightRef = useRef<THREE.DirectionalLight>(null)
  const playerRef = useRef(useStore.getState().player)
  const {
    DIRECTIONAL_LIGHT_INTENSITY,
    AMBIENT_LIGHT_INTENSITY,
    SKY_SUN_POSITION,
    MIE_COEFFICIENT,
    MIE_DIRECTIONAL_IG,
    SKY_RAYLEIGH,
    SKY_TURBIDITY,
  } = useControls(
    'Lights',
    {
      DIRECTIONAL_LIGHT_INTENSITY: {
        label: 'Directional light intensity',
        value: 1,
        min: 0,
        max: 5,
      },
      AMBIENT_LIGHT_INTENSITY: {
        label: 'Ambient light intensity',
        value: 0.3,
        min: 0,
        max: 3,
      },
      SKY_SUN_POSITION: {
        label: 'Sky light position',
        value: [-10, 7, -10],
      },
      MIE_COEFFICIENT: {
        label: 'Sky Mie coefficient',
        value: 0.05,
        min: 0,
        max: 1,
      },
      MIE_DIRECTIONAL_IG: {
        label: 'Sky Mie directional IG',
        value: 0.99,
        min: 0,
        max: 1,
      },
      SKY_RAYLEIGH: {
        label: 'Sky rayleigh',
        value: 0.08,
        min: 0,
        max: 1,
      },
      SKY_TURBIDITY: {
        label: 'Sky turbidity',
        value: 0.03,
        min: 0,
        max: 1,
      },
    },
    { collapsed: true }
  )

  useEffect(() => {
    useStore.subscribe((state) => (playerRef.current = state.player))
  }, [])

  useFrame(() => {
    if (directionalLightRef.current) {
      directionalLightRef.current.position.addVectors(
        playerRef.current.position,
        // cameraOffset
        new THREE.Vector3(...SKY_SUN_POSITION)
      )
      directionalLightRef.current.target = playerRef.current
    }
  })

  return (
    <>
      <Sky
        sunPosition={SKY_SUN_POSITION}
        mieDirectionalG={MIE_DIRECTIONAL_IG}
        mieCoefficient={MIE_COEFFICIENT}
        rayleigh={SKY_RAYLEIGH}
        turbidity={SKY_TURBIDITY}
      />
      <ambientLight intensity={AMBIENT_LIGHT_INTENSITY} />
      <directionalLight
        ref={directionalLightRef}
        castShadow
        intensity={DIRECTIONAL_LIGHT_INTENSITY}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={32}
        shadow-camera-left={-2}
        shadow-camera-right={2}
        shadow-camera-top={2}
        shadow-camera-bottom={-2}
      />
    </>
  )
}

export default Lights
