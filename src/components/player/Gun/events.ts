import { useEffect } from 'react'
import { PlayerState, PlayerSubjects } from '../../../state/playerState'
import { useGunAnimations } from './animations'
import { GunState, GunSubjects } from '../../../state/gunState'

export function useGunEvents() {
  const animations = useGunAnimations();
  
  useEffect(() => {
    const playerUnsubscribe = PlayerState.subscribeMany([
      [PlayerSubjects.AIM_BEGIN, animations.aimBegin],
      [PlayerSubjects.AIM_END, animations.aimEnd],
      [PlayerSubjects.AIM_END, animations.idle],

      [PlayerSubjects.RUN_BEGIN, animations.run],
      [PlayerSubjects.IDLE_BEGIN, animations.idle],
      [PlayerSubjects.WALK_BEGIN, animations.idle],

      [PlayerSubjects.JUMP_BEGIN, animations.idle],
      [PlayerSubjects.JUMP_BEGIN, animations.jumpBegin],
      [PlayerSubjects.JUMP_END, animations.jumpEnd],
      [PlayerSubjects.FALL_BEGIN, animations.idle],

      [PlayerSubjects.STRAFE_LEFT_BEGIN, animations.rollLeft],
      [PlayerSubjects.STRAFE_LEFT_END, animations.rollEnd],
      [PlayerSubjects.STRAFE_RIGHT_BEGIN, animations.rollRight],
      [PlayerSubjects.STRAFE_RIGHT_END, animations.rollEnd],
    ]);
    
    const gunUnsubscribe = GunState.subscribe(GunSubjects.RELOAD_BEGIN, animations.reloadBegin);
    
    return () => {
      playerUnsubscribe();
      gunUnsubscribe();
    };
  }, []);

  return { animations }
}