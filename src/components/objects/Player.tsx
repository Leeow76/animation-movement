// import { lerp } from 'three/src/math/MathUtils'
import { useStore } from '../../store'
import { useControls } from '../hooks/useControls'
import { Animation } from './types'
import {
  OrbitControls,
  OrbitControlsProps,
  useAnimations,
  useGLTF,
} from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useControls as useLevaControls } from 'leva'
import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import * as THREE from 'three'

const Player = () => {
  // Leva options controls
  const { WALK_SPEED, WALK_BACKWARDS_SPEED, RUN_SPEED, RUN_BACKWARDS_SPEED } =
    useLevaControls(
      'Movement speeds',
      {
        WALK_SPEED: { label: 'Walk', value: 1.55, min: 0.1, max: 10 },
        WALK_BACKWARDS_SPEED: {
          label: 'Walk back',
          value: 1,
          min: 0.1,
          max: 10,
        },
        RUN_SPEED: { label: 'Run', value: 4, min: 0.1, max: 10 },
        RUN_BACKWARDS_SPEED: {
          label: 'Run back',
          value: 2.5,
          min: 0.1,
          max: 10,
        },
      },
      { collapsed: true }
    )
  const [{ ACCELERATION_X, ACCELERATION_Z }, set] = useLevaControls(
    'Movement acceleration',
    () => ({
      ACCELERATION_X: { label: 'X', value: 0, min: -1, max: 1 },
      ACCELERATION_Z: { label: 'Z', value: 0, min: -1, max: 1 },
    })
  )
  const { ANIMATION_SWITCH_DURATION } = useLevaControls(
    'Animations',
    {
      ANIMATION_SWITCH_DURATION: {
        label: 'Change duration',
        value: 0.5,
        min: 0,
        max: 2,
      },
    },
    { collapsed: true }
  )

  // Animations
  const [animation, setAnimation] = useState<Animation>({
    name: 'idle',
    moveSpeed: 0,
  })
  const { scene, animations } = useGLTF('/assets/models/player.glb')
  const { ref, actions } = useAnimations(animations)

  // Camera
  const { camera } = useThree()
  const orbitRef = useRef(null)

  // Keyboard controls
  const { keysPressed, anyKeyPressed, shiftPressed } = useControls()

  // Movement direction
  const diagonalValue = useMemo(() => Math.sin(0.25 * Math.PI), [])

  // Rotation
  const orbitControlTarget = useMemo(() => new THREE.Vector3(), [])
  const rotationAxis = useMemo(() => new THREE.Vector3(0, 1, 0), [])
  const rotateQuaternion = useMemo(() => new THREE.Quaternion(), [])

  // Set correct animation
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
      shiftPressed
        ? setAnimation({ name: 'run_left', moveSpeed: RUN_SPEED })
        : setAnimation({ name: 'walk_left', moveSpeed: WALK_SPEED })
    } else if (keysPressed.right) {
      shiftPressed
        ? setAnimation({ name: 'run_right', moveSpeed: RUN_SPEED })
        : setAnimation({ name: 'walk_right', moveSpeed: WALK_SPEED })
    } else {
      setAnimation({ name: 'idle', moveSpeed: 0 })
    }
  }, [keysPressed, shiftPressed])

  // Fade between animations
  useEffect(() => {
    actions[animation.name]?.reset().fadeIn(ANIMATION_SWITCH_DURATION).play()

    return () => {
      actions[animation.name]?.fadeOut(ANIMATION_SWITCH_DURATION)
    }
  }, [animation])

  useFrame((_, delta) => {
    if (ref.current && orbitRef.current) {
      // Update orbitControl target dynamically
      const target = orbitControlTarget
        .copy(ref.current.position)
        .setY(ref.current.position.y + 1.5)
      ;(orbitRef.current as OrbitControlsProps).target = target
      const cameraPosRef = camera.position.sub(ref.current.position)

      if (keysPressed.forwardLeft) {
        set({ ACCELERATION_X: diagonalValue })
        set({ ACCELERATION_Z: diagonalValue })
      } else if (keysPressed.forwardRight) {
        set({ ACCELERATION_X: -diagonalValue })
        set({ ACCELERATION_Z: diagonalValue })
      } else if (keysPressed.backwardLeft) {
        set({ ACCELERATION_X: diagonalValue })
        set({ ACCELERATION_Z: -diagonalValue })
      } else if (keysPressed.backwardRight) {
        set({ ACCELERATION_X: -diagonalValue })
        set({ ACCELERATION_Z: -diagonalValue })
      } else if (keysPressed.forward) {
        set({ ACCELERATION_X: 0 })
        set({ ACCELERATION_Z: 1 })
      } else if (keysPressed.backward) {
        set({ ACCELERATION_X: 0 })
        set({ ACCELERATION_Z: -1 })
      } else if (keysPressed.left) {
        set({ ACCELERATION_X: 1 })
        set({ ACCELERATION_Z: 0 })
      } else if (keysPressed.right) {
        set({ ACCELERATION_X: -1 })
        set({ ACCELERATION_Z: 0 })
      } else {
        set({ ACCELERATION_X: 0 })
        set({ ACCELERATION_Z: 0 })
      }

      ref.current.translateX(ACCELERATION_X * delta * animation.moveSpeed)
      ref.current.translateZ(ACCELERATION_Z * delta * animation.moveSpeed)

      // Store player to state
      useStore.setState({ player: ref.current as THREE.Object3D })

      // Rotate player based on camera rotation
      camera.position.addVectors(ref.current.position, cameraPosRef)

      const angleYCameraDirection = Math.atan2(
        ref.current.position.x - camera.position.x,
        ref.current.position.z - camera.position.z
      )

      rotateQuaternion.setFromAxisAngle(rotationAxis, angleYCameraDirection)

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
        minPolarAngle={Math.PI / 16}
        minDistance={3}
        maxDistance={6}
        enablePan={false}
      />
    </primitive>
  )
}

export default Player
