import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { concreteHit } from './effects/concreteHit'
import { MAX_SMOKE_SYSTEMS, muzzle } from './effects/muzzle'
import { useFixedFrame } from '../../hooks/useFixedFrame'
import { PARTICLES_FPS } from '../../constants'
import { bulletCasing } from './effects/bulletCasing'
import { Vector3 } from 'three'
import { ParticleSystem } from 'three.quarks'
import { BatchedRenderer } from '../../quarks/BatchedRenderer'
import { preloadVFX } from './utils'
import { metalHit } from './effects/metalHit'
import { randomFloat } from '../../helpers'
import { useLightsContext } from '../../contexts/LightsContext'
import { BulletImpactData, WorldSubject } from '../../state/worldState/types'
import { EquipmentSubject, ShotFiredData } from '../../state/equipmentState/types'
import { WorldState } from '../../state/worldState'
import { EquipmentState } from '../../state/equipmentState'
import { fog } from './effects/fog'

const down = new Vector3(0, -1, 0);
const batchSystem = new BatchedRenderer();
let effect: ParticleSystem[];

// mesh rotation hack
let smokeSystemIndex = 0;
const smokeSystemIds: number[] = [];
const smokeSystemRotations: Map<number, number> = new Map();

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

    // mesh rotation hack
    batchSystem.batches.forEach(b => {
      b.systems.forEach(system => {
        const rotation = smokeSystemRotations.get(system.emitter.id);
        rotation && system.emitter.rotateZ(rotation);
      })
    });

    metalHitLights.forEach(light => {
      if (light.intensity > 0) {
        light.intensity = Math.max(0, light.intensity - 0.05);
      }
    });
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
    light.intensity = randomFloat(0.1, 0.175);
    light.position.copy(position);
    light.translateOnAxis(normal, 0.2);
    lightIndex.current = (lightIndex.current + 1) % metalHitLights.length;
  }

  function handleShotFired({ muzzlePosition, direction, velocity, muzzleFlash }: ShotFiredData) {
    const system = muzzle(muzzlePosition, direction, velocity, muzzleFlash, batchSystem);

    // mesh rotation hack
    system.forEach(sys => {
      if (sys.emitter.name === 'muzzleSmoke') {
        const id = sys.emitter.id;
        const rotation = randomFloat(0.01, 0.02);
        const direction = Math.random() > 0.5 ? 1 : -1;
        smokeSystemRotations.set(id, rotation * direction);
        smokeSystemIds[smokeSystemIndex] = sys.emitter.id;
      }
    })
    smokeSystemIndex = (smokeSystemIndex + 1) % MAX_SMOKE_SYSTEMS;
    smokeSystemRotations.delete(smokeSystemIds[smokeSystemIndex]);

    addToScene(system);
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