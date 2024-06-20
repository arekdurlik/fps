import * as THREE from 'three'
import { useTexture } from '@react-three/drei'
import { InstancedRigidBodies, InstancedRigidBodyProps } from '@react-three/rapier'
import { useEffect, useMemo, useRef } from 'react'
type BoxType =[THREE.Vector3 | undefined, THREE.Euler | undefined, THREE.Vector3 | undefined][]

const boxes: BoxType = [
  [
    new THREE.Vector3(1.5, 0, -3.5), 
    undefined, 
    undefined
  ],
  [
    new THREE.Vector3(1.5, 0.5, -4.5), 
    undefined, 
    undefined
  ],
  [
    new THREE.Vector3(1.5, 0.5, -5.5), 
    undefined, 
    new THREE.Vector3(1, 2, 1)
  ],

  // walls
  [
    new THREE.Vector3(0, 0.5, -20.5), 
    undefined, 
    new THREE.Vector3(30, 5, 1)
  ],
  [
    new THREE.Vector3(0, 0.5, 10.5), 
    undefined, 
    new THREE.Vector3(30, 5, 1)
  ],
  [
    new THREE.Vector3(12.5, 0.5, -4.5), 
    new THREE.Euler(0, Math.PI/2, 0), 
    new THREE.Vector3(33, 5, 1)
  ],
  [
    new THREE.Vector3(-12.5, 0.5, -4.5), 
    new THREE.Euler(0, Math.PI/2, 0), 
    new THREE.Vector3(33, 5, 1)
  ],
]

export function Boxes() {
  const ref = useRef<THREE.InstancedMesh | null>(null);
  const grid = useTexture('map2.jpg', texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.magFilter = THREE.NearestFilter;
    texture.anisotropy = 16;
    texture.repeat = new THREE.Vector2(1, 1);
  });

  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];

    for (let i = 0; i < boxes.length; i++) {
      instances.push({
        key: 'instance_' + Math.random(),
        position: boxes[i][0],
        rotation: boxes[i][1],
        scale: boxes[i][2]
      });
    }

    return instances;
  }, []);

  useEffect(() => {
    if (!ref.current) return;

    instances.forEach((_, i) => {
      const mat = new THREE.Matrix4();
      const { position, rotation, scale } = instances[i];

      position && mat.setPosition(position as THREE.Vector3);
      rotation && mat.makeRotationFromEuler(rotation as THREE.Euler);
      scale && mat.scale(scale as THREE.Vector3);
      
      ref.current!.setMatrixAt(i, mat);
    })
  }, [ref])

  return <InstancedRigidBodies instances={instances} type="fixed">
  <instancedMesh ref={ref} args={[undefined, undefined, boxes.length]} dispose={null}>
    <boxGeometry/>
    <meshStandardMaterial color="#fff" map={grid} />
  </instancedMesh>
</InstancedRigidBodies>
}