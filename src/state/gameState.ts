import { create } from 'zustand'
import * as THREE from 'three'

type GameState = {
  camera: THREE.PerspectiveCamera
  cameraWrapper: THREE.Group
};

// ease of use and getting state values in event callbacks
export const GameState = {
  setCamera(camera: THREE.PerspectiveCamera) {
    useGameState.setState({ camera });
  },
  setCameraWrapper(cameraWrapper: THREE.Group) {
    useGameState.setState({ cameraWrapper });
  },
  
  get camera() { return useGameState.getState().camera },
  get cameraWrapper() { return useGameState.getState().cameraWrapper }
};

export const useGameState = create<GameState>(() => ({
  camera: null!,
  cameraWrapper: null!,
}));