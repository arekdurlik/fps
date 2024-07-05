import { useSpring } from '@react-spring/three'
import { Debug } from '../../../state/debugState'
import { PlayerState, PlayerSubject } from '../../../state/playerState'
import { NotifyData } from '../../../types'
import { GunState } from '../../../state/gunState'

let timeoutId: NodeJS.Timeout;

export function usePlayerAnimations() {
  const [{ x, y }, spring] = useSpring(() => ({ x: 0, y: 0, zoom: 0, knockback: 0 }));
  const [{ zoom, knockback }, zoomSpring] = useSpring(() => ({ zoom: 0, knockback: 0 }));

  function idle() {
    Debug.log('Player animation: Idle', 'playerAnimation');

    timeoutId = setTimeout(() => {
      !GunState.reloading && PlayerState.setCanShoot();
    }, 200);

    spring.stop();
    spring.start({ x: 0, y: 0,  config: { duration: 200 }});
  }

  function walk() {
    Debug.log('Player animation: Walk', 'playerAnimation');

    timeoutId = setTimeout(() => {
      !GunState.reloading && PlayerState.setCanShoot();
    }, 200)

    spring.stop();
    spring.start({
      to: [
        { x: -0.0125, y: -0.03, 
          onResolve({ finished }) {
            finished && PlayerState.notify(PlayerSubject.WALK_STEP_LEFT);
          }  
        },
        { x: 0, y: 0 },
        { x: 0.0125, y: -0.03, 
          onResolve({ finished }) {
            finished && PlayerState.notify(PlayerSubject.WALK_STEP_RIGHT);
          } 
        },
        { x: 0, y: 0 }
      ],
      loop: true,
      config: { duration: 300 }
    });
  }

  function run() {
    Debug.log('Player animation: Run', 'playerAnimation');

    let firstStep = true;

    clearTimeout(timeoutId);
    PlayerState.setCanShoot(false);

    spring.stop();
    spring.start({
      to: [
        { x: -0.05, y: -0.1, 
          onResolve({ finished }) {
            finished && PlayerState.notify(PlayerSubject.RUN_STEP_LEFT, { firstStep });
            firstStep = false;
          }  
        },
        { x: 0, y: 0 },
        { x: 0.05, y: -0.1, 
          onResolve({ finished }) {
            finished && PlayerState.notify(PlayerSubject.RUN_STEP_RIGHT); 
          } 
        },
        { x: 0, y: 0 }
      ],
      loop: true,
      config: { duration: 150 }
    });
  }

  function aimBegin() {
    zoomSpring.stop();
    zoomSpring.start({ zoom: 3, config: { mass: 2, friction: 25 } });
  }
  
  function aimEnd() {
    zoomSpring.stop();
    zoomSpring.start({ zoom: 0, config: { mass: 2, friction: 10, bounce: 0 } });
  }

  function shoot() {
    const knockback = 0.5
    zoomSpring.start({
      to: [
        { knockback: -knockback, config: { friction: 0, mass: 0.5, bounce: 0 } },
        { knockback: 0, config: { duration: 400 } }
      ]
    });
  }

  function stopAnimation() {
    Debug.log('Player animation: None', 'playerAnimation');
    spring.stop();
    spring.start({ x: 0, y: 0, config: { duration: 200 }});
  }

  return {
    idle,
    walk,
    run,
    shoot,
    aimBegin,
    aimEnd,
    stopAnimation,
    get x() { return x.get() },
    get y() { return y.get() },
    get zoom() { return zoom.get() },
    get knockback() { return knockback.get() },
  };
}