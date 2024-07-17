import * as THREE from 'three'
import { GunAnimations } from './animations'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'
import { PlayerState } from '../../../state/playerState'
import { GunOpticObject } from '../../../config/gunAttachments'
import { SMG_OPTIC_PARAMS } from '../../../data'
import { Layers } from '../../../constants'

export function OpticReticle({ optic, animations }: { optic: GunOpticObject, animations: GunAnimations } ) {
  const ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);
  const { texture } = useSpriteSheet('guns/reticles.png', 4, 8, optic.reticleShape);
  const reticleScale = SMG_OPTIC_PARAMS[optic.type].reticleScale;
  
  useFrame(() => {
    const reticle = ref.current;

    if (!PlayerState.aiming && !reticle.visible) return;

    reticle.visible = animations.frame === 0 ? false : true;

    // reset
    reticle.position.set(0.00025, 0.15225, 0);
    reticle.rotation.set(0, 0, 0);

    reticle.position.x += animations.roll / 15;
    reticle.position.x += animations.velX / 10;

    reticle.position.x += animations.swayX / 7;
    reticle.position.y += animations.swayY / 7;

    reticle.position.setZ(animations.frame === 0 ? 5 : 0);
    reticle.position.x += animations.velX / 20;
    reticle.position.y += animations.velY / 20;
    reticle.position.x += animations.frame === 1 ? 0.03  : 0;
    reticle.position.y += animations.frame === 1 ? -0.02 : 0;
    
    reticle.position.x -= animations.kickX / 2;
    reticle.position.y -= animations.kickY / 2;
    
    const scale = animations.frame === 1 ? 1 : 1;
    reticle.scale.set(scale, scale, scale);
    reticle.material.opacity = animations.frame === 1 ? optic.reticleOpacity * 0.2 : optic.reticleOpacity;

    reticle.updateMatrix();
  });

  return <mesh layers={Layers.RETICLE} ref={ref} matrixAutoUpdate={false} matrixWorldAutoUpdate={false} userData={{ shootThrough: true }}>
    <planeGeometry args={[reticleScale, reticleScale, 1, 1]} />
    <meshLambertMaterial map={texture} color={optic.reticleColor} transparent depthTest={false} emissive={optic.reticleColor} emissiveIntensity={optic.reticleOpacity * 2}/>
  </mesh>
}