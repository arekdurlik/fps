import { useNearestFilterTexture } from '../../hooks/useNearestFilterTexture'
import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Billboard } from '../Billboard'
import { Triplet } from '../../types'
import { CuboidCollider, RigidBody } from '@react-three/rapier'

const plane = new THREE.PlaneGeometry(0.5, 1);

export function Barrel({ position = [0, 0, 0]}: { position: Triplet }) {
  const texture = useNearestFilterTexture('barrel.png');
  const billboard = useRef<THREE.Group>(null!);

  return <Billboard position={position}>
    <group ref={billboard}>
      <mesh position={[0, 0.5, 0]} receiveShadow geometry={plane}>
        <meshStandardMaterial map={texture} transparent color='red'/>
      </mesh>
      <RigidBody type='fixed'>
        <CuboidCollider args={[0.25, 1, 0.25]}/>
      </RigidBody>
    </group>
  </Billboard>
}