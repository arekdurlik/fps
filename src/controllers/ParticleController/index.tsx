import { useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { BatchedRenderer, ParticleSystem } from 'three.quarks'
import { BulletImpactData, WorldState, WorldSubject } from '../../state/worldState'
import { concreteHit } from './effects/concreteHit'
import { GunState, GunSubject, ShotFiredData } from '../../state/gunState'
import * as THREE from 'three'
import { muzzle } from './effects/muzzle'
import { useFixedFrame } from '../../hooks/useFixedFrame'
import { PARTICLES_FPS } from '../../constants'
import { shellCasing } from './effects/shellCasing'

/* // "PHYSICS" idea
effect.forEach(particle => {
  const down = new THREE.Vector3(0, -1, 0);
  if (!['debris', 'moreDebris'].includes(particle.emitter.name)) return;
  
  raycaster.set(particle.emitter.position, down);
  const intersects = raycaster.intersectObjects(scene.children)
  if (!intersects) return;
  const dist = intersects[0].distance ** 0.55
  
  setTimeout(() => {
    particle.emitter.position.y += lerp(0, dist * 0.04, 1.7);
    }, dist * 400);
    }) */
   
const batchSystem = new BatchedRenderer();
let effect: ParticleSystem[];

export function ParticleController() {
  const { scene } = useThree();
  
  useEffect(() => {
    scene.add(batchSystem);
    const worldUnsubscribe = WorldState.subscribe(WorldSubject.BULLET_IMPACT, handleBulletImpact);
    const gunUnsubscribe = GunState.subscribe(GunSubject.SHOT_FIRED, handleShotFired);
    return () => {
      worldUnsubscribe();
      gunUnsubscribe();
    };
  }, []);

  useFixedFrame(PARTICLES_FPS, (_, dt) => {
    batchSystem.update(dt);
  });

  function handleBulletImpact({ position, object, normal }: BulletImpactData) {
    const material = object?.userData.material;

    /* raycaster.set(position, down);
    const intersects = raycaster.intersectObjects(scene.children)
    if (!intersects) return;
    const height = intersects[0].distance ** 0.55 */

    switch (material) {
      case 'concrete': 
        effect = concreteHit(position, normal); 
        break;
      default: return;
    }

    addToScene(effect);
  }

  function handleShotFired({ position, direction, velocity }: ShotFiredData) {
    addToScene(muzzle(position, velocity));
    addToScene(shellCasing(position, direction, velocity));
  }

  function addToScene(effect: ParticleSystem[]) {

    effect.forEach(particle => {
      batchSystem.addSystem(particle);
      scene.add(particle.emitter);
    });
  }

  return null;
}