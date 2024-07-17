import { useNearestFilterTexture } from '../../hooks/useNearestFilterTexture'
import * as THREE from 'three'
import { Billboard } from './Billboard'
import { Triplet } from '../../types'
import { CuboidCollider, interactionGroups, RigidBody } from '@react-three/rapier'
import { Collisions } from '../../constants'

const plane = new THREE.PlaneGeometry(0.5, 1);

export function Barrel({ position = [0, 0, 0]}: { position: Triplet }) {
  const texture = useNearestFilterTexture('barrel.png');

  return <Billboard position={position}>
      <mesh position={[0, 0.5, 0]} geometry={plane} userData={{ material: 'metal' }}>
        <meshLambertMaterial map={texture} alphaTest={0.5}/>
      </mesh>
      <RigidBody type='fixed'>
        <CuboidCollider args={[0.25, 1, 0.25]} collisionGroups={interactionGroups(Collisions.WORLD)}/>
      </RigidBody>
  </Billboard>
}