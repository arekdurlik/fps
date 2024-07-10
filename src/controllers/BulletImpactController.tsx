import { useThree } from '@react-three/fiber'
import { WorldState, WorldSubject } from '../state/worldState'
import { useEffect } from 'react'
import { EquipmentState, EquipmentSubject, ShotFiredData } from '../state/equipmentState'

export function BulletImpactController() {
  const { raycaster, scene } = useThree();

  useEffect(() => {
    const unsubscribe = EquipmentState.subscribe(EquipmentSubject.SHOT_FIRED, handleShotFired)
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