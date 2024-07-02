import { useEffect, useMemo, useRef } from 'react'
import { GunState, GunSubject, ShotFiredData } from '../state/gunState'
import { InstancedRigidBodies, InstancedRigidBodyProps, interactionGroups, RapierRigidBody } from '@react-three/rapier'
import { BoxGeometry, InstancedMesh,  Vector3 } from 'three'
import { playSound } from '../utils'
import { Collisions } from '../constants'

const COUNT = 5;
const RIGHT_OFFSET = 0.15;

let casingIndex = 0;
const cameraUp = new Vector3(0, 1, 0);
const rightVector = new Vector3();
const initialPosition = new Vector3();

/**
* Invisible, physically simulated bullet casings that play audio on collision.
* TODO: Add positional audio
*/
export function BulletCasingController() {
  const ref = useRef<InstancedMesh>(null!)
  const rigidBodies = useRef<RapierRigidBody[]>(null);
  const instances = useMemo(() => {
    const instances: InstancedRigidBodyProps[] = [];
  
    for (let i = 0; i < COUNT; i++) {
      instances.push({
        key: "instance_" + i,
        position: [i, 1000, i],
      });
    }

    return instances;
  }, []);

  useEffect(() => {
    ref.current.visible = false;
    const unsubscribe = GunState.subscribe(GunSubject.SHOT_FIRED, spawnCasing);
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!rigidBodies.current) return;

    rigidBodies.current.forEach(body => body.sleep());
  }, []);

  function spawnCasing({ position, direction }: ShotFiredData) {
    if (!rigidBodies.current) return;

    const casing = rigidBodies.current[(casingIndex++) % COUNT];

    // direction
    rightVector.crossVectors(direction, cameraUp).normalize();
    
    // position
    initialPosition.copy(position).add(rightVector.clone().multiplyScalar(RIGHT_OFFSET));
    
    casing.setTranslation(initialPosition, true);
    const force = rightVector.clone().multiply({ x: 0.000002, y: 0.000002, z: 0.000002});
    casing.setLinvel({ x: 0, y: 0, z: 0 }, true);
    casing.applyImpulse({ x: force.x, y: force.y + 0.000001, z: force.z}, true);
  }

  return (
    <InstancedRigidBodies
      ref={rigidBodies}
      instances={instances}
      colliders="cuboid"
      mass={0}
      restitution={0.001}
      onCollisionEnter={() => playSound('casing', 0.05 + Math.random() * 0.2)}
      collisionGroups={interactionGroups(Collisions.BULLET_CASING, [Collisions.WORLD])}
    >
      <instancedMesh 
        ref={ref} 
        args={[new BoxGeometry(0.007, 0.007, 0.02), undefined, COUNT]} 
        count={COUNT} 
      />
    </InstancedRigidBodies>
  );
}