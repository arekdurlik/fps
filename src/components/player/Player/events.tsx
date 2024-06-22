import { useEffect } from 'react'
import { PlayerState } from '../../../state/playerState'
import { usePlayerAnimations } from '../../../hooks/animations/usePlayerAnimations'
import { playSound } from '../../../hooks/controllers/useAudioController'
import { GunState } from '../../../state/gunState'
import { NotifyData } from '../../../types'

export function usePlayerEvents() {
  const playerAnimations = usePlayerAnimations();
  
  useEffect(() => {
    const jump = (data: NotifyData) => !data.fall && playSound('jump');
    const land = () => playSound('land', 0.7);
    const walkL = () => playSound('walkL', 0.2);
    const walkR = () => playSound('walkR', 0.2);
    const runL = (data: NotifyData) => playSound('walkL', data.firstStep ? 0.2 : 0.4);
    const runR = () => playSound('walkR', 0.4);
    
    PlayerState.subscribe('walkStepLeft', walkL);
    PlayerState.subscribe('walkStepRight', walkR);
    PlayerState.subscribe('runStepLeft', runL);
    PlayerState.subscribe('runStepRight', runR);
    
    PlayerState.subscribe('jumpStart', jump);
    PlayerState.subscribe('jumpStart', playerAnimations.stopAnimation);
    
    PlayerState.subscribe('jumpEnd', land);
    PlayerState.subscribe('idleStart', playerAnimations.idle);
    PlayerState.subscribe('walkStart', playerAnimations.walk);
    PlayerState.subscribe('runStart', playerAnimations.run);

    GunState.subscribe('shotFired', playerAnimations.shoot)
    PlayerState.subscribe('aimStart', playerAnimations.aimStart)
    PlayerState.subscribe('aimEnd', playerAnimations.aimEnd)
    
    return () => {
      PlayerState.unsubscribe('walkStepLeft', walkL);
      PlayerState.unsubscribe('walkStepRight', walkR);
      PlayerState.unsubscribe('runStepLeft', runL);
      PlayerState.unsubscribe('runStepRight', runR);

      PlayerState.unsubscribe('jumpStart', jump);
      PlayerState.unsubscribe('jumpStart', playerAnimations.stopAnimation);

      PlayerState.unsubscribe('jumpEnd', land);
      PlayerState.unsubscribe('idleStart', playerAnimations.idle);
      PlayerState.unsubscribe('walkStart', playerAnimations.walk);
      PlayerState.unsubscribe('runStart', playerAnimations.run);
    }
  }, []);

  return { playerAnimations }
}