import { useFrame } from '@react-three/fiber'
import { ReactNode, useEffect, useRef } from 'react'
import * as THREE from 'three'
import { Triplet } from '../../types'
import { RenderOrder } from '../../constants'

export function Billboard({ children, position, rotation }: { children: ReactNode, position?: Triplet, rotation?: Triplet }) {
  const inner = useRef<THREE.Group>(null!);
  const localRef = useRef<THREE.Group>(null!);
  const v = useRef(new THREE.Vector3());
  const spritePlane = useRef<THREE.Mesh>(null!);
  const worldPos = useRef(new THREE.Vector3());
  
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
        object.renderOrder = RenderOrder.SPRITE;
        object.rotation.order = 'YXZ';
        
        worldPos.current = object.getWorldPosition(worldPos.current);
        spritePlane.current = object;
      }
    })
  }, []);
  
  useFrame(({ camera }) => {
    // face the camera but lock the y axis
    camera.getWorldPosition(v.current);
    v.current.setY(spritePlane.current.getWorldPosition(worldPos.current).y);
    spritePlane.current.lookAt(v.current);
  });

  return <group ref={localRef} position={position} rotation={rotation} name='localRef'>
    <group name='inner' ref={inner}>{children}</group>
  </group>
}