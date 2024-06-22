import { useFrame } from '@react-three/fiber'
import { ReactNode, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Triplet } from '../types'

export function Billboard({ children, position = [0, 0, 0] }: { children: ReactNode, position: Triplet }) {
  const inner = useRef<THREE.Group>(null!);
  const localRef = useRef<THREE.Group>(null!);
  const v = new THREE.Vector3();
  
  useEffect(() => {
      inner.current.traverse(object => {
        if (object instanceof THREE.Mesh && object.geometry instanceof THREE.PlaneGeometry) {
          // light up from the side and above
          object.geometry.attributes.normal.array.set([
            0, 0.5, 0.5, 
            0, 0.5, 0.5, 
            0, 0.5, 0.5, 
            0, 0.5, 0.5
          ]);
        }
      })
  }, []);
  
  useFrame(({ camera }) => {
    // face the camera but lock the y axis;
    camera.getWorldPosition(v);
    v.setY(inner.current.position.y);
    localRef.current.lookAt(v);
  });

  return <group ref={localRef} position={position}>
    <group ref={inner}>{children}</group>
  </group>
}