import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { BulletImpactData, WorldState, WorldSubject } from '../../state/worldState'
import { concreteHit } from './effects/concreteHit'
import { GunState, GunSubject, ShotFiredData } from '../../state/gunState'
import { muzzle } from './effects/muzzle'
import { useFixedFrame } from '../../hooks/useFixedFrame'
import { PARTICLES_FPS } from '../../constants'
import { bulletCasing } from './effects/bulletCasing'
import { PointLight, Vector3 } from 'three'
import { ParticleSystem } from 'three.quarks'
import { BatchedRenderer } from '../../quarks/BatchedRenderer'
import { preloadVFX } from './utils'
import { metalHit } from './effects/metalHit'

const down = new Vector3(0, -1, 0);
const batchSystem = new BatchedRenderer();
let effect: ParticleSystem[];

const SPARKLIGHT_AMOUNT = 2;
const sparkLights = new Array(SPARKLIGHT_AMOUNT).fill(null).map(() => new PointLight('#cea568', 0, 1));
let sparkLightIndex = 0;

export function ParticleController() {
  const { scene, raycaster } = useThree();
  
  useEffect(() => {
    const worldUnsubscribe = WorldState.subscribe(WorldSubject.BULLET_IMPACT, handleBulletImpact);
    const gunUnsubscribe = GunState.subscribe(GunSubject.SHOT_FIRED, handleShotFired);
    
    scene.add(batchSystem);
    preloadVFX(batchSystem, scene);

    sparkLights.forEach(light => {
      scene.add(light);
    });

    return () => {
      worldUnsubscribe();
      gunUnsubscribe();
    };
  }, []);

  useFixedFrame(PARTICLES_FPS, (_, dt) => {
    batchSystem.update(dt);

    sparkLights.forEach(light => {
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
    const light = sparkLights[sparkLightIndex];
    light.intensity = 0.025 + Math.random() * 0.1;
    light.position.copy(position);
    light.translateOnAxis(normal, 0.2);
    sparkLightIndex = (sparkLightIndex + 1) % SPARKLIGHT_AMOUNT;
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