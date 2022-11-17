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
    LERP_STEP
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
      LERP_STEP: {
        label: 'Acceleration-deceleration rate',
        value: 0.1,
        min: 0.01,
        max: 0.3,
      },
    },
    { collapsed: true }
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

  // Lerped move speed values
  const [xMoveSpeed, setXMoveSpeed] = useState(0)
  const [zMoveSpeed, setZMoveSpeed] = useState(0)
  
  // Object3D
  const playerRef = useRef<THREE.Object3D>(null)

  // Animations
  const [animation, setAnimation] = useState<Animation>('idle')
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
    if (keysPressed.invalidDirection && animation !== 'idle') {
      setAnimation('idle')
    } else if (keysPressed.forwardLeft) {
      shiftPressed
        ? setAnimation('run_forward_left')
        : setAnimation('walk_forward_left')
    } else if (keysPressed.forwardRight) {
      shiftPressed
        ? setAnimation('run_forward_right')
        : setAnimation('walk_forward_right')
    } else if (keysPressed.backwardLeft) {
      shiftPressed
        ? setAnimation('run_backward_left')
        : setAnimation('walk_backward_left')
    } else if (keysPressed.backwardRight) {
      shiftPressed
        ? setAnimation('run_backward_right')
        : setAnimation('walk_backward_right')
    } else if (keysPressed.forward) {
      shiftPressed
        ? setAnimation('run_forward')
        : setAnimation('walk_forward')
    } else if (keysPressed.backward) {
      shiftPressed
        ? setAnimation('run_backward')
        : setAnimation('walk_backward')
    } else if (keysPressed.left) {
      shiftPressed
        ? setAnimation('run_left')
        : setAnimation('walk_left')
    } else if (keysPressed.right) {
      shiftPressed
        ? setAnimation('run_right')
        : setAnimation('walk_right')
    } else {
      if (animation !== 'idle') {
        setAnimation('idle')
      }
    }
  }, [keysPressed, shiftPressed])

  // Fade between animations
  useEffect(() => {
    actions[animation]?.reset().fadeIn(ANIMATION_SWITCH_DURATION).play()

    return () => {
      actions[animation]?.fadeOut(ANIMATION_SWITCH_DURATION)
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

      // Lerp player movement values toward desired speeds
      if (keysPressed.invalidDirection) {
        setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, 0, LERP_STEP))
        setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, 0, LERP_STEP))
      } else if (keysPressed.forwardLeft) {
        if (shiftPressed) {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, RUN_SPEED * diagonalValue, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, RUN_SPEED * diagonalValue, LERP_STEP))
        } else {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, WALK_SPEED * diagonalValue, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, WALK_SPEED * diagonalValue, LERP_STEP))
        }
      } else if (keysPressed.forwardRight) {
        if (shiftPressed) {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, -RUN_SPEED * diagonalValue, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, RUN_SPEED * diagonalValue, LERP_STEP))
        } else {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, -WALK_SPEED * diagonalValue, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, WALK_SPEED * diagonalValue, LERP_STEP))
        }
      } else if (keysPressed.backwardLeft) {
        if (shiftPressed) {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, RUN_BACKWARDS_SPEED * diagonalValue, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, -RUN_BACKWARDS_SPEED * diagonalValue, LERP_STEP))
        } else {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, WALK_BACKWARDS_SPEED * diagonalValue, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, -WALK_BACKWARDS_SPEED * diagonalValue, LERP_STEP))
        }
      } else if (keysPressed.backwardRight) {
        if (shiftPressed) {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, -RUN_BACKWARDS_SPEED * diagonalValue, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, -RUN_BACKWARDS_SPEED * diagonalValue, LERP_STEP))
        } else {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, -WALK_BACKWARDS_SPEED * diagonalValue, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, -WALK_BACKWARDS_SPEED * diagonalValue, LERP_STEP))
        }
      } else if (keysPressed.forward) {
        if (shiftPressed) {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, 0, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, RUN_SPEED, LERP_STEP))
        } else {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, 0, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, WALK_SPEED, LERP_STEP))
        }
      } else if (keysPressed.backward) {
        if (shiftPressed) {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, 0, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, -RUN_BACKWARDS_SPEED, LERP_STEP))
        } else {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, 0, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, -WALK_BACKWARDS_SPEED, LERP_STEP))
        }
      } else if (keysPressed.left) {
        if (shiftPressed) {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, RUN_SPEED, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, 0, LERP_STEP))
        } else {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, WALK_SPEED, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, 0, LERP_STEP))
        }
      } else if (keysPressed.right) {
        if (shiftPressed) {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, -RUN_SPEED, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, 0, LERP_STEP))
        } else {
          setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, -WALK_SPEED, LERP_STEP))
          setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, 0, LERP_STEP))
        }
      } else {
        setXMoveSpeed(THREE.MathUtils.lerp(xMoveSpeed, 0, LERP_STEP))
        setZMoveSpeed(THREE.MathUtils.lerp(zMoveSpeed, 0, LERP_STEP))
      }

      // Translate player X, Z by lerped values
      playerRef.current.translateX(delta * xMoveSpeed)
      playerRef.current.translateZ(delta * zMoveSpeed)

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
      ref.current.scale.copy(playerRef.current.scale)

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
