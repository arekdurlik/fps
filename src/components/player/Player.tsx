
import * as RAPIER from "@dimforge/rapier3d-compat"
import * as THREE from 'three'
import { useEffect, useRef } from "react"
import { CapsuleCollider, RigidBody } from "@react-three/rapier"
import { usePlayerController } from '../../hooks/controllers/usePlayerController'
import { PerspectiveCamera } from '@react-three/drei'
import { Gun } from './Gun'
import { PlayerState } from '../../state/playerState'
import { usePlayerAnimations } from '../../hooks/animations/usePlayerAnimations'
import { useFrame, useThree } from '@react-three/fiber'
import { playSound } from '../../hooks/controllers/useAudioController'

export function Player() {
  const ref = useRef<RAPIER.RigidBody | null>(null);
  usePlayerController(ref);
  const playerAnimations = usePlayerAnimations();
  const cameraWrapper = useRef<THREE.Group | null>(null);
  const { camera } = useThree();

  useEffect(() => {
    const jump = () => playSound('jump');
    const land = () => playSound('land', 0.7);
    
    PlayerState.subscribe('jumpStart', jump);
    PlayerState.subscribe('jumpStart', playerAnimations.stopAnimation);

    PlayerState.subscribe('jumpEnd', land);
    PlayerState.subscribe('idleStart', playerAnimations.idle);
    PlayerState.subscribe('walkStart', playerAnimations.walk);
    PlayerState.subscribe('runStart', playerAnimations.run);
    
    return () => {
      PlayerState.unsubscribe('jumpStart', jump);
      PlayerState.unsubscribe('jumpStart', playerAnimations.stopAnimation);

      PlayerState.unsubscribe('jumpEnd', land);
      PlayerState.unsubscribe('idleStart', playerAnimations.idle);
      PlayerState.unsubscribe('walkStart', playerAnimations.walk);
      PlayerState.unsubscribe('runStart', playerAnimations.run);
    }
  }, [])

  useFrame(() => {
    if (!cameraWrapper.current) return;
    cameraWrapper.current.position.set(0, 0, 0);
    cameraWrapper.current.position.set(
      playerAnimations.x,
      playerAnimations.y,
      0
    );
    
    (camera as THREE.PerspectiveCamera).setFocalLength(playerAnimations.fov)
  })

  return <>
      <group ref={cameraWrapper}>
        <PerspectiveCamera makeDefault>
            <Gun />
        </PerspectiveCamera>
      </group>
      <RigidBody 
      ref={ref}  
      position={[0, -2, 0]} 
      enabledRotations={[false, false, false]}
      >
        <CapsuleCollider args={[0.5, 0.2]} />
      </RigidBody>
  </>
}
