import { create } from 'zustand'
import * as THREE from 'three'

type GameState = {
  camera: THREE.PerspectiveCamera
};

// ease of use and getting state values in event callbacks
export const GameState = {
  setCamera(camera: THREE.PerspectiveCamera) {
    useGameState.setState({ camera });
  },
  
  get camera() { return useGameState.getState().camera }
};

export const useGameState = create<GameState>(() => ({
  camera: null!,
}));