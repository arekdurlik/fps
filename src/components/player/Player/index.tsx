
import * as RAPIER from "@dimforge/rapier3d-compat"
import * as THREE from 'three'
import { useEffect, useRef } from "react"
import { CapsuleCollider, interactionGroups, RigidBody } from "@react-three/rapier"
import { PerspectiveCamera } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { usePlayerEvents } from './events'
import { GameState } from '../../../state/gameState'
import { PlayerState } from '../../../state/playerState'
import { Collisions } from '../../../constants'
import { Equipment } from '../Equipment'

const PLAYER_HEIGHT = 0.5;

export function Player() {
  const ref = useRef<RAPIER.RigidBody | null>(null);
  const cameraWrapper = useRef<THREE.Group>(null!);
  const camera = useRef<THREE.PerspectiveCamera>(null!);
  const { animations } = usePlayerEvents();

  useEffect(() => {
    GameState.setCamera(camera.current);
    camera.current.setFocalLength(15);
    PlayerState.setPlayer(ref);
  }, [ref, camera]);

  useFrame(() => {
    cameraWrapper.current.position.set(0, PLAYER_HEIGHT, 0);
    cameraWrapper.current.position.set(
      animations.x,
      PLAYER_HEIGHT + animations.y,
      0
    );
  });

  return (
    <RigidBody colliders={false} ref={ref} name='player' enabledRotations={[false, false, false]} canSleep={false}>
      <group ref={cameraWrapper}>
        <PerspectiveCamera makeDefault ref={camera}>
          <Equipment/>
        </PerspectiveCamera>
      </group>
      <CapsuleCollider args={[0.5, 0.2]} collisionGroups={interactionGroups(Collisions.PLAYER, [Collisions.WORLD])}/>
    </RigidBody>
  )
}
