import { useControls } from '../hooks/useControls'
import { Animation } from './types'
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
  const [animation, setAnimation] = useState<Animation>({ name: 'idle', moveSpeed: 0 })
  const { scene, animations } = useGLTF('/assets/models/player.glb')
  const { ref, actions } = useAnimations(animations)
  const orbitRef = useRef(null)
  const [
    forward,
    backward,
    left,
    right,
    keyPressed
  ] = useControls()

  const orbitControlTarget = useMemo(() => new THREE.Vector3(), [])
  const rotationAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const rotateQuaternion = useMemo(() => new THREE.Quaternion(), [])
  const forwardAxis = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const backwardAxis = useMemo(() => new THREE.Vector3(0, 0, -1), [])
  const leftAxis = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const rightAxis = useMemo(() => new THREE.Vector3(-1, 0, 0), [])
  const walkSpeed = useMemo(() => 1.65, [])
  const backwardsWalkSpeed = useMemo(() => 1, [])

  useEffect(() => {
    forward && setAnimation({ name: 'walk_forward', moveSpeed: walkSpeed })
  }, [forward])

  useEffect(() => {
    backward && setAnimation({ name: 'walk_backward', moveSpeed: backwardsWalkSpeed })
  }, [backward])

  useEffect(() => {
    left && setAnimation({ name: 'walk_left', moveSpeed: walkSpeed })
  }, [left])

  useEffect(() => {
    right && setAnimation({ name: 'walk_right', moveSpeed: walkSpeed })
  }, [right])

  useEffect(() => {
    !keyPressed && setAnimation({ name: 'idle', moveSpeed: walkSpeed })
  }, [keyPressed])

  useFrame((_, delta) => {
    if (ref.current && orbitRef.current) {
      const target = orbitControlTarget.copy(ref.current.position).setY(ref.current.position.y + 1.5)
      // @ts-ignore
      orbitRef.current.target = target

      const cameraPosRef = camera.position.sub(ref.current.position)

      forward && ref.current.translateOnAxis(forwardAxis, animation.moveSpeed * delta)
      backward && ref.current.translateOnAxis(backwardAxis, animation.moveSpeed * delta)
      left && ref.current.translateOnAxis(leftAxis, animation.moveSpeed * delta)
      right && ref.current.translateOnAxis(rightAxis, animation.moveSpeed * delta)

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
    actions[animation.name]?.reset().fadeIn(0.5).play()

    return () => {
      actions[animation.name]?.fadeOut(0.5)
    }
  }, [animation])

  return (
    <primitive ref={ref} rotation={[0, Math.PI, 0]} object={scene}>
      <OrbitControls
        ref={orbitRef}
        maxPolarAngle={Math.PI / 2.05}
        minDistance={3}
        maxDistance={6}
        enablePan={false}
      />
    </primitive>
  )
}

export default Player
