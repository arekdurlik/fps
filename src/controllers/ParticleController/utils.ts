import * as THREE from 'three'
import { BatchedRenderer } from 'three.quarks'
import { concreteHit } from './effects/concreteHit'
import { muzzle } from './effects/muzzle'
import { bulletCasing } from './effects/bulletCasing'
import { metalHit } from './effects/metalHit'

export function preloadVFX(batchSystem: BatchedRenderer, scene: THREE.Scene) {
  const vec = new THREE.Vector3(0, 0, 50);
  
  const effects = [
    metalHit(vec, vec),
    concreteHit(vec, vec, 0), 
    muzzle(vec, vec, vec, true, batchSystem), 
    bulletCasing(vec, vec, vec),
  ];

  effects.forEach(effect => {
    effect.forEach(particle => {
      batchSystem.addSystem(particle);
      scene.add(particle.emitter);
    });
  });
}