
import * as RAPIER from "@dimforge/rapier3d-compat"
import * as THREE from 'three'
import { useEffect, useRef } from "react"
import { CapsuleCollider, RigidBody } from "@react-three/rapier"
import { usePlayerController } from '../../../hooks/controllers/usePlayerController'
import { PerspectiveCamera } from '@react-three/drei'
import { Gun } from '../Gun/Gun'
import { useFrame } from '@react-three/fiber'
import { usePlayerEvents } from './events'
import { GameState } from '../../../state/gameState'

export function Player() {
  const ref = useRef<RAPIER.RigidBody | null>(null);
  usePlayerController(ref);
  const cameraWrapper = useRef<THREE.Group>(null!);
  const camera = useRef<THREE.PerspectiveCamera>(null!)
  const { playerAnimations } = usePlayerEvents();

  useEffect(() => {
    GameState.setCamera(camera.current)
  }, [camera])

  // render player on top of everything
  useEffect(() => {
    cameraWrapper.current.traverse(object =>{ 
      object.renderOrder = 2;

      object.userData.shootThrough = true;
    })
  }, [])

  useFrame(() => {
    cameraWrapper.current.position.set(0, 0, 0);
    cameraWrapper.current.position.set(
      playerAnimations.x,
      playerAnimations.y,
      0
    );
    
    camera.current.setFocalLength(15 + playerAnimations.zoom + playerAnimations.knockback);
  });

  return <>
      <group ref={cameraWrapper}>
        <PerspectiveCamera makeDefault ref={camera}>
          <Gun />
        </PerspectiveCamera>
      </group>
      <RigidBody ref={ref} name='player' position={[0, -2, 0]} enabledRotations={[false, false, false]}>
        <CapsuleCollider args={[0.5, 0.2]} />
      </RigidBody>
  </>
}
