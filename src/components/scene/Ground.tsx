import * as THREE from 'three'
import { CuboidCollider, RigidBody } from "@react-three/rapier"
import { useTexture } from '@react-three/drei'
export function Ground() {
  const grid = useTexture('map.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat = new THREE.Vector2(100, 100);
  });

  return (
    <RigidBody type="fixed" colliders={false}>
      <mesh receiveShadow position={[0, 0, 0]} rotation-x={-Math.PI / 2} userData={{ material: 'concrete' }}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#fff" map={grid}/>
      </mesh>
      <CuboidCollider args={[100, 2, 100]} position={[0, -2, 0]}/>
    </RigidBody>
  )
}
