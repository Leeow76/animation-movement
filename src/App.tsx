import Lights from './components/misc/Lights'
import Floor from './components/objects/Floor'
import Player from './components/objects/Player'
import { OrbitControls } from '@react-three/drei'
import { Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import React from 'react'

const App = () => {
  return (
    <Canvas camera={{ position: [0, 2, 3] }} shadows>
      {/* Misc */}
      <color attach="background" args={['lightgrey']} />
      <Stats />
      <Lights />
      <OrbitControls />

      {/* Objects */}
      <Player />
      <Floor />
    </Canvas>
  )
}

export default App
