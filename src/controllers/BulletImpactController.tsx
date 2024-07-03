import { useThree } from '@react-three/fiber'
import { WorldState, WorldSubject } from '../state/worldState'
import * as THREE from 'three'
import { useEffect } from 'react'
import { GameState } from '../state/gameState'
import { GunState, GunSubject, ShotFiredData } from '../state/gunState'

const pos = new THREE.Vector3();
const dir = new THREE.Vector3();

export function BulletImpactController() {
  const { raycaster, scene } = useThree();

  useEffect(() => {
    const unsubscribe = GunState.subscribe(GunSubject.SHOT_FIRED, handleShotFired)
    return () => unsubscribe();
  }, []);

  function handleShotFired({ eyePosition, direction }: ShotFiredData) {
    raycaster.set(eyePosition, direction);

    const intersects = raycaster
      .intersectObjects(scene.children)
      .filter(int => int?.object?.userData.shootThrough ? false : true)
      .filter(int => !['LineSegments', 'VFXBatch'].includes(int?.object?.type)); // physics debug, particle stuff

    if (intersects.length === 0) return;

    const hit = intersects[0];
    
    if (hit.face?.normal && hit.object) {
      WorldState.notify(WorldSubject.BULLET_IMPACT, {
        position: hit.point,
        normal: hit.face?.normal,
        object: hit.object
      });
    }
  }

  return <></>
}