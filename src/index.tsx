import App from './App'
import './styles.css'
import { softShadows } from '@react-three/drei'
import * as React from 'react'
import { createRoot } from 'react-dom/client'

// Inject soft shadow shader
softShadows()

const container = document.getElementById('root')
if (container !== null) {
  const root = createRoot(container)
  root.render(<App />)
}
