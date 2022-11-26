import { MeshReflectorMaterial, useTexture } from '@react-three/drei'
import React from 'react'
import * as THREE from 'three'

const Floor = () => {
  const roughness = useTexture(
    '/assets/textures/roughness_floor.jpeg',
    (txt) => {
      const texture = txt as THREE.Texture
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping
      texture.offset.set(0, 0)
      texture.repeat.set(32, 32)
    }
  )

  // NormalMap currently breaks reflection (reflection has offset (also in their storybook))

  // const normal = useTexture('/assets/textures/NORM.jpg',
  //   (txt) => {
  //     const texture = txt as THREE.Texture
  //     texture.wrapS = texture.wrapT = THREE.RepeatWrapping
  //     texture.offset.set(0, 0)
  //     texture.repeat.set(48, 48)
  //   })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry attach="geometry" args={[512, 512]} />
      <MeshReflectorMaterial
        mirror={1}
        resolution={1024}
        mixStrength={1.5}
        // normalMap={normal}
        roughnessMap={roughness}
        metalness={0.4}
        roughness={8}
        mixBlur={10}
        blur={100}
      />
    </mesh>
  )
}

export default Floor
