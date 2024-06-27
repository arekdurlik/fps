import { useFrame, useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { BatchedRenderer, ParticleSystem } from 'three.quarks'
import { BulletImpactData, WorldState, WorldSubject } from '../../state/worldState'
import { concreteHit } from './effects/concreteHit'

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
    WorldState.subscribe(WorldSubject.BULLET_IMPACT, spawnEffect)
  }, []);

  useFrame((_, dt) => {
    batchSystem.update(dt);
  });

  function spawnEffect({ position, object, normal }: BulletImpactData) {
    if (!position || !normal || !object) return;

    const material = object?.userData.material;
    
    switch (material) {
      case 'concrete': effect = concreteHit(normal); break;
      default: return;
    }

    effect.forEach(particle => {
      particle.emitter.position.add(position);
      batchSystem.addSystem(particle);
      scene.add(particle.emitter);
    });
  }

  return null;
}