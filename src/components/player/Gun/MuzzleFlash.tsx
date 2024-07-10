import { useFrame } from '@react-three/fiber'
import { GunAnimations } from './animations'
import { useLightsContext } from '../../../contexts/LightsContext'

export function MuzzleFlash({ animations }: { animations: GunAnimations }) {
  const { muzzleFlashLight } = useLightsContext()

  useFrame(() => {
    muzzleFlashLight.intensity = animations.muzzleflash;
  });
  
  return null;
}