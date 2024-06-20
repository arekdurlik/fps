import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useNearestFilterTexture } from '../../hooks/useNearestFilterTexture'
import { useFrame } from '@react-three/fiber'
import { useGunAnimations } from '../../hooks/animations/useGunAnimations'
import { PlayerState } from '../../state/playerState'

export function Gun() {
  const texture = useNearestFilterTexture('gun-idle.png');
  const gun = useRef<THREE.Group | null>(new THREE.Group);
  const geom = useRef<THREE.PlaneGeometry | null>(null);
  const gunWrapper = useRef<THREE.Group | null>(null);
  const gunAnimations = useGunAnimations();

  useFrame(() => {
    gunAnimations.hipSway();
  })

  useEffect(() => {
    PlayerState.subscribe('runStart', gunAnimations.run);
    PlayerState.subscribe('idleStart', gunAnimations.idle);
    PlayerState.subscribe('walkStart', gunAnimations.idle);

    PlayerState.subscribe('jumpStart', gunAnimations.idle);
    PlayerState.subscribe('jumpStart', gunAnimations.jumpStart);
    PlayerState.subscribe('jumpEnd', gunAnimations.jumpEnd);
    PlayerState.subscribe('fallStart', gunAnimations.idle);

    PlayerState.subscribe('strafeLeftStart', gunAnimations.rollLeft);
    PlayerState.subscribe('strafeRightStart', gunAnimations.rollRight);
    PlayerState.subscribe('strafeLeftEnd', gunAnimations.rollEnd);
    PlayerState.subscribe('strafeRightEnd', gunAnimations.rollEnd);
    
    return () => {
      PlayerState.unsubscribe('runStart', gunAnimations.run);
      PlayerState.unsubscribe('idleStart', gunAnimations.idle);
      PlayerState.unsubscribe('walkStart', gunAnimations.idle);
      
      PlayerState.unsubscribe('jumpStart', gunAnimations.idle);
      PlayerState.unsubscribe('jumpStart', gunAnimations.jumpStart);
      PlayerState.unsubscribe('jumpEnd', gunAnimations.jumpEnd);
      PlayerState.unsubscribe('fallStart', gunAnimations.idle);

      PlayerState.unsubscribe('strafeLeftStart', gunAnimations.rollLeft);
      PlayerState.unsubscribe('strafeRightStart', gunAnimations.rollRight);
      PlayerState.unsubscribe('strafeLeftEnd', gunAnimations.rollEnd);
      PlayerState.unsubscribe('strafeRightEnd', gunAnimations.rollEnd);
    }
  }, [])

  useEffect(() => {
    if (!geom.current) return;

    // make gun sprite normal face up so it at least get's lit up from above
    geom.current.attributes.normal.array.set([
      0, 1, 0, 
      0, 1, 0, 
      0, 1, 0, 
      0, 1, 0
    ]);

  }, [geom])

  useFrame(() => {
    if (!gunWrapper.current) return;

    // reset
    gunWrapper.current.position.set(0, 0, 0);
    gunWrapper.current.rotation.set(0, 0, 0);

    // add gun animations
    gunWrapper.current.position.x += gunAnimations.x;
    gunWrapper.current.position.y += gunAnimations.y;

    // add mouse velocity
    gunWrapper.current.position.x += gunAnimations.velX;
    gunWrapper.current.position.y += gunAnimations.velY;

    // add jump animation
    gunWrapper.current.position.y += gunAnimations.jumpY;

    // add roll
    gunWrapper.current.rotation.z += gunAnimations.roll + (gunAnimations.velX / 2);
  })

  return <group ref={gun} position={[0.05, -0.04, -0.2]} scale={0.23}>
      <group ref={gunWrapper}>
        <mesh receiveShadow>
          <planeGeometry args={[1, 1, 1, 1]} ref={geom}/>
          <meshLambertMaterial map={texture} transparent depthTest={false}/>
        </mesh>
        {/* <mesh position={[-0.17, 0.04, -0.01]}>
          <planeGeometry args={[2, 2, 1, 1]} ref={geom}/>
          <meshBasicMaterial map={muzzleflash} transparent depthTest={false}/>
        </mesh> */}
      </group>  
    </group>
}