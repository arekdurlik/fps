import * as THREE from 'three'
import { GunAnimations } from './animations'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGunState } from '../../../state/gunState'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'

export function Reticle({ animations }: { animations: GunAnimations } ) {
  const ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);
  const reticle = useGunState(state => state.reticle);
  const reticleColor = useGunState(state => state.reticleColor);
  const { texture } = useSpriteSheet('reticles.png', 20, 20, reticle);
  
  useFrame(() => {
    ref.current.position.set(0.00025, 0.15225, 0);
    ref.current.rotation.set(0, 0, 0);

    ref.current.position.x += animations.roll / 15;
    ref.current.position.x += animations.velX / 10;

    ref.current.position.setZ(animations.frame === 0 ? 5 : 0);
    ref.current.material.opacity = animations.frame === 1 ? 0.2 : 1;
    const scale = animations.frame === 1 ? 0.6 : 1;
    ref.current.scale.set(scale, scale, scale);
    ref.current.position.x += animations.velX / 20;
    ref.current.position.y += animations.velY / 20;
    ref.current.position.x += animations.frame === 1 ? 0.03  : 0;
    ref.current.position.y += animations.frame === 1 ? -0.02 : 0;

    ref.current.position.x += animations.kickX / 2;
    ref.current.position.y += animations.kickY / 2;

    ref.current.updateMatrix();
  });

  return <mesh ref={ref} matrixAutoUpdate={false} matrixWorldAutoUpdate={false} userData={{ shootThrough: true }}>
    <planeGeometry args={[1/12, 1/12, 1, 1]} />
    <meshBasicMaterial map={texture} color={reticleColor} transparent/>
  </mesh>
}