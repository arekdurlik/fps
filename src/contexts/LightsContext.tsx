import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { createContext, ReactNode, useContext, useEffect, useState } from 'react'
import { GameState } from '../state/gameState'

type Lights = THREE.Light[];

type LightContext = { 
  lights: Lights, 
  metalHitLights: Lights 
  muzzleFlashLight: THREE.Light 
};

/**
 * Light budget for entire scene
 */
const LightsContext = createContext<LightContext>(null!);
export const useLightsContext = () => useContext(LightsContext);

const TOTAL_LIGHTS = 10;

const MUZZLE_FLASH_LIGHTS = 1;
const METAL_HIT_LIGHTS = 2; 
const REMAINING_LIGHTS = TOTAL_LIGHTS - METAL_HIT_LIGHTS - METAL_HIT_LIGHTS;

export function LightsContextProvider({ children }: { children: ReactNode }) {
  const [muzzleFlashLights] = useState(new Array(MUZZLE_FLASH_LIGHTS).fill(null).map(() => new THREE.PointLight('#d89c43', 0, 10, 0.7)));
  const [metalHitLights] = useState(new Array(METAL_HIT_LIGHTS).fill(null).map(() => new THREE.PointLight('#d89c43', 0, 10, 0.7)));
  const [lights] = useState<Lights>(new Array(REMAINING_LIGHTS).fill(null).map(() => new THREE.PointLight('000', 0, 1)));

  const { scene } = useThree();

  // add muzzle flash to camera
  useEffect(() => {
    if (!GameState.camera) return;

    GameState.camera.add(muzzleFlashLights[0]);
    muzzleFlashLights[0].position.set(0, 0.05, -0.4);

  }, [GameState.camera]);

  // add all the lights to the scene
  useEffect(() => {
    lights.forEach(light => scene.add(light));
    metalHitLights.forEach(light => scene.add(light));
  }, []);

  return (
    <LightsContext.Provider value={{ lights, metalHitLights, muzzleFlashLight: muzzleFlashLights[0] }}>
      {children}
    </LightsContext.Provider>
  )
}