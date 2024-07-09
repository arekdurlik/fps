import * as THREE from 'three'
import { GunAnimations } from './animations'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'
import { useGunState } from '../../../state/gunState'
import { SMG_PARAMS } from '../../../data'
import { RenderOrder } from '../../../constants'
import { PlayerState } from '../../../state/playerState'
const normalArray = new Uint8Array([0,1,0, 0,1,0, 0,1,0, 0,1,0]); 

export function IronSight({ animations }: { animations: GunAnimations } ) {
  const ref = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);
  const hasReticle = useGunState(state => state.reticle);
  const renderParams = hasReticle ? SMG_PARAMS.reddot : SMG_PARAMS.stock;
  const { texture } = useSpriteSheet(renderParams.ironsight, 64, 64, 0);
  
  useFrame(() => {
    const sight = ref.current;

    if (!PlayerState.aiming && !sight.visible) return;
    
    sight.visible = animations.frame === 0 ? false : true;

    // reset
    sight.position.set(0.00025, renderParams.ironSightY, 0);
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
    
    sight.updateMatrix();
  });

  return <mesh ref={ref} renderOrder={RenderOrder.GUN_IRONSIGHT} matrixAutoUpdate={false} matrixWorldAutoUpdate={false} userData={{ shootThrough: true }}>
    <planeGeometry args={[1/2.3, 1/2.3, 1, 1]}>
      <bufferAttribute attach="attributes-normal" array={normalArray} itemSize={3}/>
    </planeGeometry>
    <meshLambertMaterial map={texture} transparent depthTest={false}/>
  </mesh>
}