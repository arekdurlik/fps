import { useEffect } from 'react'
import { usePlayerAnimations } from './animations'
import { playSound } from '../../../utils'
import { EquipmentState } from '../../../state/equipmentState'
import { EquipmentSubject } from '../../../state/equipmentState/types'
import { JumpBeginData, PlayerSubject, RunStepLeftData } from '../../../state/playerState/types'
import { PlayerState } from '../../../state/playerState'
import { randomFloat, randomInt } from '../../../helpers'

export function usePlayerEvents() {
  const animations = usePlayerAnimations();
  
  useEffect(() => {
    const jump = (data: JumpBeginData) => !data?.fall && playSound('jump', 0.4);
    const land = () => playSound('land', 0.2);
    const walkL = () => playSound(`walk${randomInt(1, 2)}`, randomFloat(0.6, 0.8));
    const walkR = () => playSound(`walk${randomInt(3, 4)}`, randomFloat(0.6, 0.8));
    const runL = ({ firstStep }: RunStepLeftData) => { playSound(`walk${randomInt(1, 2)}`, firstStep ? 0.6 : randomFloat(0.7, 1)) };
    const runR = () => playSound(`walk${randomInt(3, 4)}`, randomFloat(0.7, 1));
    const canShoot = () => PlayerState.setCanShoot(true);
    const cantShoot = () => PlayerState.setCanShoot(false);

    const playerUnsubscribe = PlayerState.subscribeMany([
      [PlayerSubject.WALK_STEP_LEFT, walkL],
      [PlayerSubject.WALK_STEP_RIGHT, walkR],
      [PlayerSubject.RUN_STEP_LEFT, runL],
      [PlayerSubject.RUN_STEP_RIGHT, runR],

      [PlayerSubject.JUMP_BEGIN, jump],
      [PlayerSubject.JUMP_BEGIN, animations.stopAnimation],
      [PlayerSubject.JUMP_END, land],

      [PlayerSubject.IDLE_BEGIN, animations.idle],
      [PlayerSubject.WALK_BEGIN, animations.walk],
      [PlayerSubject.RUN_BEGIN, animations.run],

      [PlayerSubject.AIM_BEGIN, animations.aimBegin],
      [PlayerSubject.AIM_END, animations.aimEnd],
    ]);
    
    const eqUnsubscribe = EquipmentState.subscribeMany([
      [EquipmentSubject.SHOT_FIRED, animations.shoot],
      [EquipmentSubject.RELOAD_BEGIN, cantShoot],
      [EquipmentSubject.EQUIP_BEGIN, cantShoot],
      [EquipmentSubject.EQUIP_END, canShoot],
    ]);
    
    return () => {
      playerUnsubscribe();
      eqUnsubscribe();
    }
  }, []);

  return { animations }
}