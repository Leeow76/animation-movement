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
  const {
    WALK_SPEED,
    WALK_BACKWARDS_SPEED,
    RUN_SPEED,
    RUN_BACKWARDS_SPEED,
    PLAYER_ROTATION_MAX_SPEED,
  } = useLevaControls(
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
      PLAYER_ROTATION_MAX_SPEED: {
        label: 'Rotation speed',
        value: 6,
        min: 0.5,
        max: 16,
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

  // Object3D
  const playerRef = useRef<THREE.Object3D>(null)

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
      if (animation.name !== 'idle') {
        setAnimation({ name: 'idle', moveSpeed: 0 })
      }
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
    if (playerRef.current && orbitRef.current && ref.current) {
      // Update orbitControl target dynamically
      const target = orbitControlTarget
        .copy(playerRef.current.position)
        .setY(playerRef.current.position.y + 1.5)
      ;(orbitRef.current as OrbitControlsProps).target = target

      // Store camera offset from player position before transforming player position
      const cameraPosRef = camera.position.sub(playerRef.current.position)

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

      playerRef.current.translateX(ACCELERATION_X * delta * animation.moveSpeed)
      playerRef.current.translateZ(ACCELERATION_Z * delta * animation.moveSpeed)

      // Store player to state
      useStore.setState({ player: playerRef.current as THREE.Object3D })

      // Set new camera position based on stored camera offset after transforming player position
      camera.position.addVectors(playerRef.current.position, cameraPosRef)

      // Find radian value to rotate on Y axis
      const angleYCameraDirection = Math.atan2(
        playerRef.current.position.x - camera.position.x,
        playerRef.current.position.z - camera.position.z
      )

      rotateQuaternion.setFromAxisAngle(rotationAxis, angleYCameraDirection)

      // Rotate player object3D position camera rotation
      playerRef.current.quaternion.copy(rotateQuaternion)

      // Copy visual model position from player object3D position
      ref.current.position.copy(playerRef.current.position)

      // Smoothly rotate model quaternion to forward facing direction
      anyKeyPressed &&
        ref.current.quaternion.rotateTowards(
          rotateQuaternion,
          delta * PLAYER_ROTATION_MAX_SPEED
        )
    }
  })

  // Make model cast shadow properly
  useLayoutEffect(() => {
    scene.traverse(
      (obj) => (obj as THREE.Mesh).isMesh && (obj.castShadow = true)
    )
  }, [])

  return (
    <>
      <object3D ref={playerRef} />
      <primitive rotation={[0, Math.PI, 0]} ref={ref} object={scene}>
        <OrbitControls
          ref={orbitRef}
          maxPolarAngle={Math.PI / 2.05}
          minPolarAngle={Math.PI / 16}
          minDistance={3}
          maxDistance={6}
          enablePan={false}
          enableDamping={false}
        />
      </primitive>
    </>
  )
}

export default Player
