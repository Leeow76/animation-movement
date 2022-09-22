import React from 'react'

const Lights = () => {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight
        castShadow
        position={[2.5, 8, 5]}
        intensity={2.5}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={20}
        shadow-camera-left={-5}
        shadow-camera-right={5}
        shadow-camera-top={5}
        shadow-camera-bottom={-5}
      />
    </>
  )
}

export default Lights
