import * as THREE from 'three'
import { RefObject, useEffect, useRef } from 'react'
import { PlayerState } from '../../../state/playerState'
import { useGunAnimations } from './animations'
import { playSound } from '../../../utils'
import { BULLET_SPREAD_FPS } from '../../../constants'
import { useFixedFrame } from '../../../hooks/useFixedFrame'
import { lerp } from 'three/src/math/MathUtils.js'
import { randomFloat } from '../../../helpers'
import { GameState } from '../../../state/gameState'
import { EquipmentState, useEquipmentState} from '../../../state/equipmentState'
import { GunData, WEAPONS_DATA } from '../../../data'
import { GunState } from '../../../state/equipmentState/gunState'
import { PlayerSubject } from '../../../state/playerState/types'
import { EquipmentSubject } from '../../../state/equipmentState/types'

const MAX_SPREAD = 0.4;
const HIP_BASE_SPREAD = 0.01;
const HIP_SPREAD_MULT = 2;
const spreadVec = new THREE.Vector3();

export function useGunEvents(muzzleRef: RefObject<THREE.Group>) {
  const gunData = WEAPONS_DATA[GunState.equipped.itemName] as GunData;
  const animations = useGunAnimations();
  const lastShotTimestamp = useRef(0);
  const spreadMult = useRef(0);
  
  useEffect(() => {
    const playerUnsubscribe = PlayerState.subscribeMany([
      [PlayerSubject.AIM_BEGIN, animations.aimBegin],
      [PlayerSubject.AIM_END, animations.aimEnd],
      [PlayerSubject.AIM_END, animations.idle],

      [PlayerSubject.RUN_BEGIN, animations.run],
      [PlayerSubject.IDLE_BEGIN, animations.idle],
      [PlayerSubject.WALK_BEGIN, animations.idle],

      [PlayerSubject.JUMP_BEGIN, animations.idle],
      [PlayerSubject.JUMP_BEGIN, animations.jumpBegin],
      [PlayerSubject.JUMP_END, animations.jumpEnd],
      [PlayerSubject.FALL_BEGIN, animations.idle],

      [PlayerSubject.STRAFE_LEFT_BEGIN, animations.rollLeft],
      [PlayerSubject.STRAFE_LEFT_END, animations.rollEnd],
      [PlayerSubject.STRAFE_RIGHT_BEGIN, animations.rollRight],
      [PlayerSubject.STRAFE_RIGHT_END, animations.rollEnd],

      [PlayerSubject.USE_EQUIPMENT, tryShoot],
    ]);
    
    const eqUnsubscribe = EquipmentState.subscribeMany([
      [EquipmentSubject.RELOAD_BEGIN, animations.reloadBegin],
      [EquipmentSubject.MAGAZINE_EMPTY, handleEmptyShotFired]
    ]);
    
    return () => {
      playerUnsubscribe();
      eqUnsubscribe();
    };
  }, []);

  useFixedFrame(BULLET_SPREAD_FPS, () => {
    if (Date.now() - lastShotTimestamp.current < gunData.rateOfFire + 0.1) {
      spreadMult.current = lerp(spreadMult.current, MAX_SPREAD, 0.055);
    } else {
      spreadMult.current = lerp(spreadMult.current, 0, 0.3);
    }
  });

  function tryShoot() {
    if (Date.now() - lastShotTimestamp.current < gunData.rateOfFire) return;

    if (GunState.equipped.roundsLeft === 0) {
      EquipmentState.notify(EquipmentSubject.MAGAZINE_EMPTY);
    } else {
      handleShotFired();
    }
  }
  
  function handleShotFired() {
    lastShotTimestamp.current = Date.now();
    GunState.decreaseAmmoInMag();

    const aiming = PlayerState.aiming;
    
    const recoilX = randomFloat(gunData.recoilXMin, gunData.recoilXMax);
    const recoilY = randomFloat(gunData.recoilYMin, gunData.recoilYMax);
    const kickX = randomFloat(gunData.kickXMin, gunData.kickXMax);
    const kickY = randomFloat(gunData.kickYMin, gunData.kickYMax);
    
    const baseSpread = aiming ? 0 : HIP_BASE_SPREAD;
    const mult = aiming ? spreadMult.current : spreadMult.current * HIP_SPREAD_MULT;
    const spread = gunData.spread * mult;
    const spreadX = randomFloat(-baseSpread -spread, baseSpread + spread);
    const spreadY = randomFloat(-baseSpread -spread, baseSpread + spread);
    const spreadZ = randomFloat(-baseSpread -spread, baseSpread + spread);
    spreadVec.set(spreadX, spreadY, spreadZ);

    const knockbackMult = aiming ? 0.5 : 1;
    const knockback = randomFloat(gunData.knockbackMin, gunData.knockbackMax) * knockbackMult;

    const muzzleFlash = Math.random() > 0.75;

    const data = {
      eyePosition: GameState.camera.getWorldPosition(new THREE.Vector3()),
      muzzlePosition: muzzleRef.current!.getWorldPosition(new THREE.Vector3()),
      direction: GameState.camera.getWorldDirection(new THREE.Vector3()).add(spreadVec),
      velocity: PlayerState.velocity,

      damage: gunData.damage,
      recoilX,
      recoilY,
      kickX,
      kickY,
      knockback,
      muzzleFlash
    }

    playSound('gunshot', 0.3);
    animations.shoot(data);
    EquipmentState.notify(EquipmentSubject.SHOT_FIRED, data);
  }

  function handleEmptyShotFired() {
    playSound('emptyGunshot', 0.3);
    lastShotTimestamp.current = Date.now();
  }

  return { animations }
}