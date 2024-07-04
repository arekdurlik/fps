import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import * as THREE from 'three'
import { GunAnimations } from './animations'

export function MuzzleFlash({ animations }: { animations: GunAnimations }) {
  const light = useRef<THREE.PointLight>(null!);

  useFrame(() => {
    light.current.intensity = animations.muzzleflash;
  });
  
  return <pointLight ref={light} args={['#ddac62', 1, 10, 0]} position={[0, 0.2, -1]} castShadow/>
}