import * as THREE from 'three'
import { CuboidCollider, interactionGroups, RigidBody, TrimeshCollider } from "@react-three/rapier"
import { useNextTickTexture } from '../../hooks/useNextTickTexture'
import { useGLTF } from '@react-three/drei'
import { useNearestFilterTexture } from '../../hooks/useNearestFilterTexture'
import { Collisions } from '../../constants'

export function Ground() {
  const { nodes } = useGLTF('dunes.glb');
  const grid = useNextTickTexture('map.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat = new THREE.Vector2(400, 400);
  });
  const sand = useNearestFilterTexture('sand.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.anisotropy = 16;
    texture.repeat = new THREE.Vector2(50, 50);
  });

  return (
    <>
      <RigidBody type="fixed" colliders='trimesh' collisionGroups={interactionGroups(Collisions.WORLD)}>
        <mesh geometry={nodes.Plane.geometry}>
          <meshStandardMaterial map={sand} color='#ddd'/>
        </mesh>
      </RigidBody>
        <mesh receiveShadow position={[0, 0, 0]} rotation-x={-Math.PI / 2} userData={{ material: 'concrete' }}>
          <planeGeometry args={[400, 400]} />
          <meshStandardMaterial color="#ffe8c8" map={grid} />
        </mesh>
        <CuboidCollider args={[100, 2, 100]} position={[0, -2, 0]} collisionGroups={interactionGroups(Collisions.WORLD)}/>
    </>
  )
}
