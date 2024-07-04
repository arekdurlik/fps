import { useEffect } from 'react'
import { PlayerState, PlayerSubject } from '../../../state/playerState'
import { GunState, GunSubject } from '../../../state/gunState'
import { NotifyData } from '../../../types'
import { usePlayerAnimations } from './animations'
import { playSound } from '../../../utils'

export function usePlayerEvents() {
  const animations = usePlayerAnimations();
  
  useEffect(() => {
    const jump = (data: NotifyData) => !data.fall && playSound('jump');
    const land = () => playSound('land', 0.7);
    const walkL = () => playSound('walkL', 0.2);
    const walkR = () => playSound('walkR', 0.2);
    const runL = (data: NotifyData) => playSound('walkL', data.firstStep ? 0.2 : 0.4);
    const runR = () => playSound('walkR', 0.4);
    const reloadBegin = () => PlayerState.setCanShoot(false);

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
    
    const gunUnsubscribe = GunState.subscribeMany([
      [GunSubject.SHOT_FIRED, animations.shoot],
      [GunSubject.RELOAD_BEGIN, reloadBegin],
    ]);
    
    return () => {
      playerUnsubscribe();
      gunUnsubscribe();
    }
  }, []);

  return { animations }
}