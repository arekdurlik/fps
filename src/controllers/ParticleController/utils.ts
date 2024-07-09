import * as THREE from 'three'
import { BatchedRenderer } from 'three.quarks'
import { concreteHit } from './effects/concreteHit'
import { muzzle } from './effects/muzzle'
import { bulletCasing } from './effects/bulletCasing'

export function preloadVFX(batchSystem: BatchedRenderer, scene: THREE.Scene) {
  const vec = new THREE.Vector3(0, 0, 50);
  
  const effects = [
    concreteHit(vec, vec, 0), 
    muzzle(vec, vec, vec, true), 
    bulletCasing(vec, vec, vec),
  ];

  effects.forEach(effect => {
    effect.forEach(particle => {
      batchSystem.addSystem(particle);
      scene.add(particle.emitter);
    });
  });
}