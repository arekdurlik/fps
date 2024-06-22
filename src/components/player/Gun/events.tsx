import { useEffect } from 'react'
import { PlayerState } from '../../../state/playerState'
import { useGunAnimations } from '../../../hooks/animations/useGunAnimations'
import { GunState } from '../../../state/gunState'

export function useGunEvents() {
  const gunAnimations = useGunAnimations();
  
  useEffect(() => {
    PlayerState.subscribe('aimStart', gunAnimations.aimStart);
    PlayerState.subscribe('aimEnd', gunAnimations.aimEnd);
    PlayerState.subscribe('aimEnd', gunAnimations.idle);

    PlayerState.subscribe('runStart', gunAnimations.run);
    PlayerState.subscribe('idleStart', gunAnimations.idle);
    PlayerState.subscribe('walkStart', gunAnimations.idle);

    PlayerState.subscribe('jumpStart', gunAnimations.idle);
    PlayerState.subscribe('jumpStart', gunAnimations.jumpStart);
    PlayerState.subscribe('jumpEnd', gunAnimations.jumpEnd);
    PlayerState.subscribe('fallStart', gunAnimations.idle);

    PlayerState.subscribe('strafeLeftStart', gunAnimations.rollLeft);
    PlayerState.subscribe('strafeRightStart', gunAnimations.rollRight);
    PlayerState.subscribe('strafeLeftEnd', gunAnimations.rollEnd);
    PlayerState.subscribe('strafeRightEnd', gunAnimations.rollEnd);

    GunState.subscribe('reloadStart', gunAnimations.reloadStart);
    
    return () => {
      PlayerState.unsubscribe('runStart', gunAnimations.run);
      PlayerState.unsubscribe('idleStart', gunAnimations.idle);
      PlayerState.unsubscribe('walkStart', gunAnimations.idle);
      
      PlayerState.unsubscribe('jumpStart', gunAnimations.idle);
      PlayerState.unsubscribe('jumpStart', gunAnimations.jumpStart);
      PlayerState.unsubscribe('jumpEnd', gunAnimations.jumpEnd);
      PlayerState.unsubscribe('fallStart', gunAnimations.idle);

      PlayerState.unsubscribe('strafeLeftStart', gunAnimations.rollLeft);
      PlayerState.unsubscribe('strafeRightStart', gunAnimations.rollRight);
      PlayerState.unsubscribe('strafeLeftEnd', gunAnimations.rollEnd);
      PlayerState.unsubscribe('strafeRightEnd', gunAnimations.rollEnd);
    }
  }, []);

  return { gunAnimations }
}