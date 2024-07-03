import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { BulletImpactData, WorldState, WorldSubject } from '../../state/worldState'
import { concreteHit } from './effects/concreteHit'
import { GunState, GunSubject, ShotFiredData } from '../../state/gunState'
import { muzzle } from './effects/muzzle'
import { useFixedFrame } from '../../hooks/useFixedFrame'
import { PARTICLES_FPS } from '../../constants'
import { bulletCasing } from './effects/bulletCasing'
import { Vector3 } from 'three'
import { ParticleSystem } from 'three.quarks'
import { BatchedRenderer } from '../../quarks/BatchedRenderer'
import { preloadVFX } from './utils'

const down = new Vector3(0, -1, 0);
const batchSystem = new BatchedRenderer();
let effect: ParticleSystem[];

export function ParticleController() {
  const { scene, raycaster } = useThree();
  
  useEffect(() => {
    const worldUnsubscribe = WorldState.subscribe(WorldSubject.BULLET_IMPACT, handleBulletImpact);
    const gunUnsubscribe = GunState.subscribe(GunSubject.SHOT_FIRED, handleShotFired);
    
    scene.add(batchSystem);
    preloadVFX(batchSystem, scene);

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

    raycaster.set(position, down);
    const intersects = raycaster.intersectObjects(scene.children);
    let height = 100;

    if (intersects[0]?.distance) {
      height = intersects[0].distance ** 0.55;
    }
    
    switch (material) {
      case 'concrete': 
        effect = concreteHit(position, normal, height); 
        break;
      default: return;
    }

    addToScene(effect);
  }

  function handleShotFired({ muzzlePosition, direction, velocity }: ShotFiredData) {
    addToScene(muzzle(muzzlePosition, direction, velocity));
    addToScene(bulletCasing(muzzlePosition, direction, velocity));
  }

  function addToScene(effect: ParticleSystem[]) {
    effect.forEach(particle => {
      batchSystem.addSystem(particle);
      scene.add(particle.emitter);
    });
  }

  return null;
}