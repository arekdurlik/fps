import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { BulletImpactData, WorldState, WorldSubject } from '../../state/worldState'
import { concreteHit } from './effects/concreteHit'
import { muzzle } from './effects/muzzle'
import { useFixedFrame } from '../../hooks/useFixedFrame'
import { PARTICLES_FPS } from '../../constants'
import { bulletCasing } from './effects/bulletCasing'
import { Vector3 } from 'three'
import { ParticleSystem } from 'three.quarks'
import { BatchedRenderer } from '../../quarks/BatchedRenderer'
import { preloadVFX } from './utils'
import { metalHit } from './effects/metalHit'
import { randomFloat } from '../../helpers'
import { EquipmentState, EquipmentSubject, ShotFiredData } from '../../state/equipmentState'
import { useLightsContext } from '../../contexts/LightsContext'

const down = new Vector3(0, -1, 0);
const batchSystem = new BatchedRenderer();
let effect: ParticleSystem[];

export function ParticleController() {
  const { metalHitLights } = useLightsContext();
  const { scene, raycaster } = useThree();
  const lightIndex = useRef(0);

  useEffect(() => {
    const worldUnsubscribe = WorldState.subscribe(WorldSubject.BULLET_IMPACT, handleBulletImpact);
    const eqUnsubscribe = EquipmentState.subscribe(EquipmentSubject.SHOT_FIRED, handleShotFired);
    
    scene.add(batchSystem);
    preloadVFX(batchSystem, scene);

    return () => {
      worldUnsubscribe();
      eqUnsubscribe();
    };
  }, []);

  useFixedFrame(PARTICLES_FPS, (_, dt) => {
    batchSystem.update(dt);

    metalHitLights.forEach(light => {
      if (light.intensity > 0) {
        light.intensity = Math.max(0, light.intensity - 0.05);
      }
    })
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
      case 'metal':
        effect = metalHit(position, normal);
        makeSpark(position, normal);
        break;
      default: return;
    }

    addToScene(effect);
  }

  function makeSpark(position: Vector3, normal: Vector3) {
    const light = metalHitLights[lightIndex.current];
    light.intensity = randomFloat(0.025, 0.125);
    light.position.copy(position);
    light.translateOnAxis(normal, 0.2);
    lightIndex.current = (lightIndex.current + 1) % metalHitLights.length;
  }

  function handleShotFired({ muzzlePosition, direction, velocity, muzzleFlash }: ShotFiredData) {
    addToScene(muzzle(muzzlePosition, direction, velocity, muzzleFlash));
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