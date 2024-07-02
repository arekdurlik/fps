
import * as RAPIER from "@dimforge/rapier3d-compat"
import * as THREE from 'three'
import { useEffect, useRef } from "react"
import { CapsuleCollider, RigidBody } from "@react-three/rapier"
import { PerspectiveCamera } from '@react-three/drei'
import { Gun } from '../Gun'
import { useFrame } from '@react-three/fiber'
import { usePlayerEvents } from './events'
import { GameState } from '../../../state/gameState'
import { PlayerState } from '../../../state/playerState'

export function Player() {
  const ref = useRef<RAPIER.RigidBody | null>(null);
  const cameraWrapper = useRef<THREE.Group>(null!);
  const camera = useRef<THREE.PerspectiveCamera>(null!);
  const { animations } = usePlayerEvents();

  useEffect(() => {
    GameState.setCamera(camera.current);
    PlayerState.setPlayer(ref);
  }, [ref, camera]);

  useFrame(() => {
    cameraWrapper.current.position.set(0, 0, 0);
    cameraWrapper.current.position.set(
      animations.x,
      animations.y,
      0
    );
    
    camera.current.setFocalLength(15 + animations.zoom + animations.knockback);
  });

  return <>
      <RigidBody  ref={ref} name='player' position={[0, 0, 0]} enabledRotations={[false, false, false]} canSleep={false}>
        <group ref={cameraWrapper}>
          <PerspectiveCamera makeDefault ref={camera}>
            <Gun/>
          </PerspectiveCamera>
        </group>
        <CapsuleCollider args={[1, 0.2]}/>
      </RigidBody>
  </>
}
