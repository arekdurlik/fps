import * as THREE from 'three'
import { CuboidCollider, interactionGroups, RigidBody } from "@react-three/rapier"
import { Collisions } from '../../constants'
import { useNextTickTexture } from '../../hooks/useNextTickTexture'

export function Ground() {
  const grid = useNextTickTexture('map.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat = new THREE.Vector2(100, 100);
  });

  return (
    <RigidBody type="fixed" colliders={false} userData={{ material: 'concrete' }}>
      <mesh receiveShadow position={[0, 0, 0]} rotation-x={-Math.PI / 2} userData={{ material: 'concrete' }}>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#fff" map={grid}/>
      </mesh>
      <CuboidCollider args={[100, 2, 100]} position={[0, -2, 0]} collisionGroups={interactionGroups(Collisions.WORLD)}/>
    </RigidBody>
  )
}
