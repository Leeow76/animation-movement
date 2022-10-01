import { useControls } from '../hooks/useControls'
import { Animation } from './types'
import {
  OrbitControls,
  OrbitControlsProps,
  useAnimations,
  useGLTF,
} from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'
import { lerp } from 'three/src/math/MathUtils'

const Player = () => {
  const { camera } = useThree()
  const [animation, setAnimation] = useState<Animation>({
    name: 'idle',
    moveSpeed: 0,
  })
  const { scene, animations } = useGLTF('/assets/models/player.glb')
  const { ref, actions } = useAnimations(animations)
  const orbitRef = useRef(null)
  const { keysPressed, anyKeyPressed } = useControls()

  // Rotation
  const orbitControlTarget = useMemo(() => new THREE.Vector3(), [])
  const rotationAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const rotateQuaternion = useMemo(() => new THREE.Quaternion(), [])

  // Directions
  const forwardAxis = useMemo(() => new THREE.Vector3(0, 0, 1), [])
  const backwardAxis = useMemo(() => new THREE.Vector3(0, 0, -1), [])
  const leftAxis = useMemo(() => new THREE.Vector3(1, 0, 0), [])
  const rightAxis = useMemo(() => new THREE.Vector3(-1, 0, 0), [])

  // Speeds
  const walkSpeed = useMemo(() => 1.55, [])
  const backwardsWalkSpeed = useMemo(() => 1, [])
  const [accelerationMultiplier, setAccelerationMultiplier] = useState(0)

  useEffect(() => {
    if (
      keysPressed.forward ||
      keysPressed.forwardRight ||
      keysPressed.forwardLeft
    ) {
      !actions['walk_forward']?.isRunning() &&
        setAnimation({ name: 'walk_forward', moveSpeed: walkSpeed })
    } else if (
      keysPressed.backward ||
      keysPressed.backwardRight ||
      keysPressed.backwardLeft
    ) {
      !actions['walk_backward']?.isRunning() &&
        setAnimation({ name: 'walk_backward', moveSpeed: backwardsWalkSpeed })
    } else if (keysPressed.left) {
      setAnimation({ name: 'walk_left', moveSpeed: walkSpeed })
    } else if (keysPressed.right) {
      setAnimation({ name: 'walk_right', moveSpeed: walkSpeed })
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
      const target = orbitControlTarget
        .copy(ref.current.position)
        .setY(ref.current.position.y + 1.5)
      ;(orbitRef.current as OrbitControlsProps).target = target
      const cameraPosRef = camera.position.sub(ref.current.position)

      anyKeyPressed &&
        setAccelerationMultiplier(
          accelerationMultiplier < 0.99
            ? lerp(accelerationMultiplier, 1, 0.1)
            : 1
        )
      !anyKeyPressed &&
        setAccelerationMultiplier(
          accelerationMultiplier > 0.01
            ? lerp(accelerationMultiplier, 0, 0.1)
            : 0
        )

      let axis = forwardAxis
      let speed = 0
      if (keysPressed.forward || keysPressed.forwardLeft || keysPressed.forwardRight) {
        speed = walkSpeed
      } else if (keysPressed.backward || keysPressed.forwardLeft || keysPressed.backwardLeft) {
        axis = backwardAxis
        speed = backwardsWalkSpeed
      } else if (keysPressed.left) {
        axis = leftAxis
        speed = walkSpeed
      } else if (keysPressed.right) {
        axis = rightAxis
        speed = walkSpeed
      }

      keysPressed &&
        ref.current.translateOnAxis(
          axis,
          speed * accelerationMultiplier * delta
        )

      camera.position.addVectors(ref.current.position, cameraPosRef)

      const angleYCameraDirection = Math.atan2(
        ref.current.position.x - camera.position.x,
        ref.current.position.z - camera.position.z
      )

      let directionOffset = 0
      if (keysPressed.forwardRight) {
        directionOffset = -0.25 * Math.PI
      } else if (keysPressed.forwardLeft) {
        directionOffset = 0.25 * Math.PI
      } else if (keysPressed.backwardLeft) {
        directionOffset = -0.25 * Math.PI
      } else if (keysPressed.backwardRight) {
        directionOffset = 0.25 * Math.PI
      }

      rotateQuaternion.setFromAxisAngle(
        rotationAxis,
        angleYCameraDirection + directionOffset
      )

      anyKeyPressed &&
        ref.current.quaternion.rotateTowards(rotateQuaternion, delta * 4)
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
