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
  const { keysPressed, multipleKeysPressed } = useControls()

  // Rotation
  const orbitControlTarget = useMemo(() => new THREE.Vector3(), [])
  const rotationAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const rotateQuaternion = useMemo(() => new THREE.Quaternion(), [])

  // Directions
  const forwardAxis = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const forwardLeftAxis = useMemo(() => new THREE.Vector3(1, 0, 1).normalize(), [])
  const forwardRightAxis = useMemo(() => new THREE.Vector3(-1, 0, 1).normalize(), [])
  const backwardAxis = useMemo(() => new THREE.Vector3(0, 0, -1), [])
  const backwardLeftAxis = useMemo(() => new THREE.Vector3(1, 0, -1).normalize(), [])
  const backwardRightAxis = useMemo(() => new THREE.Vector3(-1, 0, -1).normalize(), [])
  const leftAxis = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const rightAxis = useMemo(() => new THREE.Vector3(-1, 0, 0), [])

  // Speeds
  const walkSpeed = useMemo(() => 1.65, [])
  const backwardsWalkSpeed = useMemo(() => 1, [])

  useEffect(() => {
    if (keysPressed.forward || keysPressed.forwardRight || keysPressed.forwardLeft) {
      setAnimation({ name: 'walk_forward', moveSpeed: walkSpeed })
    } else if (keysPressed.backward || keysPressed.backwardRight || keysPressed.backwardLeft) {
      setAnimation({ name: 'walk_backward', moveSpeed: backwardsWalkSpeed })
    } else if (keysPressed.left) {
      setAnimation({ name: 'walk_left', moveSpeed: walkSpeed });
    } else if (keysPressed.right) {
      setAnimation({ name: 'walk_right', moveSpeed: walkSpeed });
    } else {
      setAnimation({ name: 'idle', moveSpeed: 0 })
    }
  }, [keysPressed])

  useEffect(() => {
    console.log(animation.name)
    actions[animation.name]?.reset().fadeIn(0.5).play()

    return () => {
      actions[animation.name]?.fadeOut(0.5)
    }
  }, [animation])

  useFrame((_, delta) => {
    if (ref.current && orbitRef.current) {
      const target = orbitControlTarget.copy(ref.current.position).setY(ref.current.position.y + 1.5)
      // @ts-ignore
      orbitRef.current.target = target
      const cameraPosRef = camera.position.sub(ref.current.position)

      keysPressed.forward && !multipleKeysPressed && ref.current.translateOnAxis(forwardAxis, animation.moveSpeed * delta)
      keysPressed.backward && !multipleKeysPressed && ref.current.translateOnAxis(backwardAxis, animation.moveSpeed * delta)
      keysPressed.left && !multipleKeysPressed && ref.current.translateOnAxis(leftAxis, animation.moveSpeed * delta)
      keysPressed.right && !multipleKeysPressed && ref.current.translateOnAxis(rightAxis, animation.moveSpeed * delta)
      keysPressed.forwardRight && ref.current.translateOnAxis(forwardRightAxis, animation.moveSpeed * delta)
      keysPressed.forwardLeft && ref.current.translateOnAxis(forwardLeftAxis, animation.moveSpeed * delta)
      keysPressed.backwardLeft && ref.current.translateOnAxis(backwardLeftAxis, animation.moveSpeed * delta)
      keysPressed.backwardRight && ref.current.translateOnAxis(backwardRightAxis, animation.moveSpeed * delta)

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
