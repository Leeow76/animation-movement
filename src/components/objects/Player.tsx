import { useControls } from '../hooks/useControls'
import { useControls as useLevaControls } from 'leva'
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
  const {
    WALK_SPEED,
    WALK_BACKWARDS_SPEED,
    RUN_SPEED,
    RUN_BACKWARDS_SPEED,
  } = useLevaControls('Movement speeds', {
    WALK_SPEED: { label: 'Walk', value: 1.55},
    WALK_BACKWARDS_SPEED: { label: 'Walk back', value: 1},
    RUN_SPEED: { label: 'Run', value: 4},
    RUN_BACKWARDS_SPEED: { label: 'Run back', value: 2.5},
  })
  const [animation, setAnimation] = useState<Animation>({
    name: 'idle',
    moveSpeed: 0,
  })
  const { scene, animations } = useGLTF('/assets/models/player.glb')
  const { ref, actions } = useAnimations(animations)
  const orbitRef = useRef(null)
  const { keysPressed, anyKeyPressed, shiftPressed } = useControls()

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
  const [accelerationMultiplier, setAccelerationMultiplier] = useState(0)

  useEffect(() => {
    if (
      keysPressed.forward ||
      keysPressed.forwardRight ||
      keysPressed.forwardLeft
    ) {
      if (shiftPressed && animation.name !== 'run_forward') {
        setAnimation({ name: 'run_forward', moveSpeed: RUN_SPEED })
      }
      if (!shiftPressed && animation.name !== 'walk_forward') {
        setAnimation({ name: 'walk_forward', moveSpeed: WALK_SPEED })
      }
    } else if (
      keysPressed.backward ||
      keysPressed.backwardRight ||
      keysPressed.backwardLeft
    ) {
      if (shiftPressed && animation.name !== 'run_backward') {
        setAnimation({ name: 'run_backward', moveSpeed: RUN_BACKWARDS_SPEED })
      }
      if (!shiftPressed && animation.name !== 'walk_backward') {
        setAnimation({ name: 'walk_backward', moveSpeed: WALK_BACKWARDS_SPEED })      
      }
    } else if (keysPressed.left) {
      shiftPressed ?
        setAnimation({ name: 'run_left', moveSpeed: RUN_SPEED }) :
        setAnimation({ name: 'walk_left', moveSpeed: WALK_SPEED })
    } else if (keysPressed.right) {
      shiftPressed ?
        setAnimation({ name: 'run_right', moveSpeed: RUN_SPEED }) :
        setAnimation({ name: 'walk_right', moveSpeed: WALK_SPEED })
    } else {
      setAnimation({ name: 'idle', moveSpeed: 0 })
    }
  }, [keysPressed, shiftPressed])

  useEffect(() => {
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

      // Smooth acceleration
      anyKeyPressed &&
        setAccelerationMultiplier(
          accelerationMultiplier < 0.99
            ? lerp(accelerationMultiplier, animation.moveSpeed, 0.05)
            : 1
        )
      !anyKeyPressed &&
        setAccelerationMultiplier(
          accelerationMultiplier > 0.01
            ? lerp(accelerationMultiplier, 0, 0.05)
            : 0
        )

      // Move in direction, speed
      let axis = forwardAxis
      if (keysPressed.forward || keysPressed.forwardLeft || keysPressed.forwardRight) {
        axis = forwardAxis
      } else if (keysPressed.backward || keysPressed.backwardLeft || keysPressed.backwardRight) {
        axis = backwardAxis
      } else if (keysPressed.left) {
        axis = leftAxis
      } else if (keysPressed.right) {
        axis = rightAxis
      }

      keysPressed &&
        ref.current.translateOnAxis(
          axis,
          animation.moveSpeed * accelerationMultiplier * delta
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
        onClick={() => console.log('onClick')}
      />
    </primitive>
  )
}

export default Player
