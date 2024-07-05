import * as THREE from 'three'
import { GunAnimations } from './animations'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGunState } from '../../../state/gunState'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'
import { PlayerState } from '../../../state/playerState'

export function Reticle({ animations }: { animations: GunAnimations } ) {
  const ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);
  const reticleOpacity = useGunState(state => state.reticleOpacity);
  const reticleShape = useGunState(state => state.reticleShape);
  const reticleColor = useGunState(state => state.reticleColor);
  const { texture } = useSpriteSheet('guns/reticles.png', 20, 20, reticleShape);
  
  useFrame(() => {
    const reticle = ref.current;

    if (!PlayerState.aiming && !reticle.visible) return;

    reticle.visible = animations.frame === 0 ? false : true;

    // reset
    reticle.position.set(0.00025, 0.15225, 0);
    reticle.rotation.set(0, 0, 0);

    reticle.position.x += animations.roll / 15;
    reticle.position.x += animations.velX / 10;

    reticle.position.setZ(animations.frame === 0 ? 5 : 0);
    reticle.position.x += animations.velX / 20;
    reticle.position.y += animations.velY / 20;
    reticle.position.x += animations.frame === 1 ? 0.03  : 0;
    reticle.position.y += animations.frame === 1 ? -0.02 : 0;
    
    reticle.position.x -= animations.kickX / 2;
    reticle.position.y -= animations.kickY / 2;
    
    const scale = animations.frame === 1 ? 0.6 : 1;
    reticle.scale.set(scale, scale, scale);
    reticle.material.opacity = animations.frame === 1 ? reticleOpacity * 0.2 : reticleOpacity;

    reticle.updateMatrix();
  });



  return <mesh ref={ref} matrixAutoUpdate={false} matrixWorldAutoUpdate={false} userData={{ shootThrough: true }}>
    <planeGeometry args={[1/12, 1/12, 1, 1]} />
    <meshBasicMaterial map={texture} color={reticleColor} transparent depthTest={false}/>
  </mesh>
}