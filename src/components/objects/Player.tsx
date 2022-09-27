import { useControls } from '../hooks/useControls'
import { AnimationName } from './types'
import { OrbitControls, useAnimations, useGLTF } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'

const Player = () => {
  const { camera } = useThree()
  const [animation, setAnimation] = useState<AnimationName>('idle')
  const { scene, animations } = useGLTF('/assets/models/player.glb')
  const { ref, actions } = useAnimations(animations)
  const orbitRef = useRef(null)
  const [forward, left, right, keyPressed] = useControls()

  const rotationAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const rotateQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const forwardAxis = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const leftAxis = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const rightAxis = useMemo(() => new THREE.Vector3(-1, 0, 0), [])
  const walkSpeed = useMemo(() => 1.65, [])

  useEffect(() => {
    forward && setAnimation('walk_forward')
  }, [forward])

  useEffect(() => {
    left && setAnimation('walk_left')
  }, [left])

  useEffect(() => {
    right && setAnimation('walk_right')
  }, [right])

  useEffect(() => {
    !keyPressed && setAnimation('idle')
  }, [keyPressed])

  useFrame((_, delta) => {
    if (ref.current && orbitRef.current) {
      // @ts-ignore
      orbitRef.current.target = ref.current.position

      const cameraPosRef = camera.position.sub(ref.current.position)

      forward && ref.current.translateOnAxis(forwardAxis, walkSpeed * delta)
      left && ref.current.translateOnAxis(leftAxis, walkSpeed * delta)
      right && ref.current.translateOnAxis(rightAxis, walkSpeed * delta)

      camera.position.addVectors(ref.current.position, cameraPosRef)

      const angleYCameraDirection = Math.atan2(
        ref.current.position.x - camera.position.x,
        ref.current.position.z - camera.position.z
      )

      rotateQuaternion.setFromAxisAngle(rotationAxis, angleYCameraDirection)
      ref.current.quaternion.rotateTowards(rotateQuaternion, 0.2)
    }
  })

  useLayoutEffect(() => {
    scene.traverse(
      (obj) => (obj as THREE.Mesh).isMesh && (obj.castShadow = true)
    )
  }, [])

  useEffect(() => {
    actions[animation]?.reset().fadeIn(0.5).play()

    return () => {
      actions[animation]?.fadeOut(0.5)
    }
  }, [animation])

  return (
    <primitive ref={ref} rotation={[0, Math.PI, 0]} object={scene}>
      <OrbitControls
        ref={orbitRef}
        maxPolarAngle={Math.PI / 2.05}
        enablePan={false}
      />
    </primitive>
  )
}

export default Player
