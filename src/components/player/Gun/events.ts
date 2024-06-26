import { useEffect } from 'react'
import { PlayerState, PlayerSubject } from '../../../state/playerState'
import { useGunAnimations } from './animations'
import { GunState, GunSubject } from '../../../state/gunState'

export function useGunEvents() {
  const animations = useGunAnimations();
  
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
    ]);
    
    const gunUnsubscribe = GunState.subscribe(GunSubject.RELOAD_BEGIN, animations.reloadBegin);
    
    return () => {
      playerUnsubscribe();
      gunUnsubscribe();
    };
  }, []);

  return { animations }
}