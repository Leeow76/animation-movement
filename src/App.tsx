import Lights from './components/misc/Lights'
import Floor from './components/objects/Floor'
import Player from './components/objects/Player'
import { Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import React from 'react'

const App = () => (
  <>
    <Canvas camera={{ position: [0, 4, 6] }} shadows>
      {/* Misc */}
      <color attach="background" args={['powderblue']} />
      <Stats />
      <Lights />

      {/* Objects */}
      <Player />
      <Floor />
    </Canvas>

    <Leva oneLineLabels />
  </>
)

export default App
