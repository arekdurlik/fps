import { useEffect } from 'react'
import { PlayerState, PlayerSubjects } from '../../../state/playerState'
import { GunState, GunSubjects } from '../../../state/gunState'
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
    
    const playerUnsubscribe = PlayerState.subscribeMany([
      [PlayerSubjects.WALK_STEP_LEFT, walkL],
      [PlayerSubjects.WALK_STEP_RIGHT, walkR],
      [PlayerSubjects.RUN_STEP_LEFT, runL],
      [PlayerSubjects.RUN_STEP_RIGHT, runR],

      [PlayerSubjects.JUMP_BEGIN, jump],
      [PlayerSubjects.JUMP_BEGIN, animations.stopAnimation],

      [PlayerSubjects.JUMP_END, land],
      [PlayerSubjects.IDLE_BEGIN, animations.idle],
      [PlayerSubjects.WALK_BEGIN, animations.walk],
      [PlayerSubjects.RUN_BEGIN, animations.run],

      [PlayerSubjects.AIM_BEGIN, animations.aimBegin],
      [PlayerSubjects.AIM_END, animations.aimEnd],
    ])
    const gunUnsubscribe = GunState.subscribe(GunSubjects.SHOT_FIRED, animations.shoot)
    
    return () => {
      playerUnsubscribe();
      gunUnsubscribe();
    }
  }, []);

  return { animations }
}