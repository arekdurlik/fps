import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { CuboidCollider, RigidBody } from '@react-three/rapier'
import { Triplet } from '../../types'

export function Box({ position = [0, 0, 0], rotation = [0, 0, 0] }: { position?: Triplet, rotation?: Triplet }) {
  const grid = useTexture('map2.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat = new THREE.Vector2(1, 1);
  });

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh position={position} rotation={rotation} name='box' receiveShadow>
        <boxGeometry args={[1, 1]} />
        <meshStandardMaterial color="#fff" map={grid}/>
      </mesh>
      <CuboidCollider args={[0.5, 0.5, 0.5]} position={position} rotation={rotation}/>
    </RigidBody>
  )
}