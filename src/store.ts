import { mountStoreDevtool } from 'simple-zustand-devtools'
import * as THREE from 'three'
import create from 'zustand'

export interface State {
  player: THREE.Object3D
}

export const initialState: State = {
  player: new THREE.Object3D()
}

export const useStore = create<State>(() => initialState)

if (process.env.NODE_ENV === 'development') {
  mountStoreDevtool('Store', useStore)
}
