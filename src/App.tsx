import Lights from './components/misc/Lights'
import Floor from './components/objects/Floor'
import Player from './components/objects/Player'
import { Loader, Stats } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { Leva } from 'leva'
import React, { Suspense } from 'react'

const App = () => (
  <>
    <Canvas camera={{ position: [0, 4, 6] }} shadows>
      {/* Misc */}
      <Stats />
      <Lights />

      <Suspense fallback={null}>
        {/* Objects */}
        <Player />
        <Floor />
      </Suspense>
    </Canvas>
    <Loader />

    <Leva oneLineLabels />
  </>
)

export default App
