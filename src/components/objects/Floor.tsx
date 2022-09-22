import { useTexture } from '@react-three/drei'
import React from 'react'
import * as THREE from 'three'

const Floor = () => {
  const texture = useTexture(
    '/assets/textures/templategrid_albedo.png',
    (txt) => {
      const texture = txt as THREE.Texture
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.offset.set(0, 0)
      texture.repeat.set(16, 16)
    }
  )

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry attach="geometry" args={[96, 96]} />
      <meshStandardMaterial map={texture} attach="material" transparent />
    </mesh>
  )
}

export default Floor
