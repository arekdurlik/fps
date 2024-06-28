import { useNearestFilterTexture } from '../../hooks/useNearestFilterTexture'
import * as THREE from 'three'
import { Billboard } from './Billboard'
import { Triplet } from '../../types'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { RenderOrder } from '../../constants'

const plane = new THREE.PlaneGeometry(0.5, 1);

export function Barrel({ position = [0, 0, 0]}: { position: Triplet }) {
  const texture = useNearestFilterTexture('barrel.png');

  return <Billboard position={position}>
      <mesh position={[0, 0.5, 0]} receiveShadow geometry={plane}>
        <meshStandardMaterial map={texture} transparent />
      </mesh>
      <RigidBody type='fixed'>
        <CuboidCollider args={[0.25, 1, 0.25]}/>
      </RigidBody>
  </Billboard>
}