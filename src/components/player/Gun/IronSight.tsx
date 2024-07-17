import * as THREE from 'three'
import { GunAnimations } from './animations'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SMG_PARAMS } from '../../../data'
import { Layers, RenderOrder } from '../../../constants'
import { PlayerState } from '../../../state/playerState'
import { useNearestFilterTexture } from '../../../hooks/useNearestFilterTexture'

export function IronSight({ animations, hasOptic, normalArray }: { animations: GunAnimations, hasOptic: boolean, normalArray: Uint8Array } ) {
  const ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);
  const renderParams = hasOptic ? SMG_PARAMS.ironsight.optic : SMG_PARAMS.ironsight.stock;
  const texture = useNearestFilterTexture(renderParams.texture);
  
  useFrame(() => {
    const sight = ref.current;

    if (!PlayerState.aiming && !sight.visible) return;
    
    sight.visible = animations.frame === 0 ? false : true;

    // reset
    sight.position.set(0.00025, renderParams.offsetY, 0);
    sight.rotation.set(0, 0, 0);
    
    sight.position.x += animations.posX;
    sight.position.y += animations.jumpY / 2;

    sight.position.x += animations.roll / 15;

    sight.position.setZ(animations.frame === 0 ? 5 : 0);
    sight.material.opacity = animations.frame === 2 ? 1: 0;

    sight.position.x += animations.velX / 3.25;
    sight.position.y += animations.velY / 5;
    sight.position.x += animations.frame === 1 ? 0.03  : 0;
    sight.position.y += animations.frame === 1 ? -0.02 : 0;

    sight.position.x -= animations.kickX / 2;
    sight.position.y -= animations.kickY / 2;
    sight.position.z += animations.knockback;
    
    sight.position.x += animations.reloadX;
    sight.rotation.z -= animations.reloadY;
    sight.position.y += animations.reloadY;

    sight.position.y += animations.knockback / 3;
    
    sight.updateMatrix();
  });

  return <mesh ref={ref} renderOrder={RenderOrder.GUN_IRONSIGHT} layers={Layers.GUN} matrixAutoUpdate={false} matrixWorldAutoUpdate={false} userData={{ shootThrough: true }}>
    <planeGeometry args={[1/2.3, 1/2.3, 1, 1]}>
      <bufferAttribute attach="attributes-normal" array={normalArray} itemSize={3}/>
    </planeGeometry>
    <meshLambertMaterial map={texture} transparent/>
  </mesh>
}