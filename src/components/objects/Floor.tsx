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
      texture.repeat.set(4, 4)
    }
  )

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry attach="geometry" args={[16, 16]} />
      <meshStandardMaterial map={texture} attach="material" />
    </mesh>
  )
}

export default Floor
