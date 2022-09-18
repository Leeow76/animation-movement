import * as React from "react";
import { createRoot } from 'react-dom/client';
import { Canvas } from '@react-three/fiber'
import './styles.css'
import { Stats } from '@react-three/drei'
import App from "./App";

const container = document.getElementById('root');
if (container !== null) {
  const root = createRoot(container)
  root.render(
    <Canvas>
      <Stats />
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <App />
    </Canvas>
  );
}

