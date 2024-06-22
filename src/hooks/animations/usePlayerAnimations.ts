import { useSpring } from '@react-spring/three'
import { Debug } from '../../state/consoleState'
import { PlayerState } from '../../state/playerState'
import { NotifyData } from '../../types'

export function usePlayerAnimations() {
  const [{ x, y }, spring] = useSpring(() => ({ x: 0, y: 0, zoom: 0, knockback: 0 }));
  const [{ zoom, knockback }, zoomSpring] = useSpring(() => ({ zoom: 0, knockback: 0 }));

  function idle() {
    Debug.log('Player animation: Idle', 'playerAnimation');

    spring.stop();
    spring.start({ x: 0, y: 0,  config: { duration: 200 }});
  }

  function walk() {
    Debug.log('Player animation: Walk', 'playerAnimation');

    spring.stop();
    spring.start({
      to: [
        { x: -0.0125, y: -0.03, 
          onResolve({ finished }) {
            finished && PlayerState.notify('walkStepLeft');
          }  
        },
        { x: 0, y: 0 },
        { x: 0.0125, y: -0.03, 
          onResolve({ finished }) {
            finished && PlayerState.notify('walkStepRight');
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

    spring.stop();
    spring.start({
      to: [
        { x: -0.05, y: -0.1, 
          onResolve({ finished }) {
            finished && PlayerState.notify('runStepLeft', { firstStep });
            firstStep = false;
          }  
        },
        { x: 0, y: 0 },
        { x: 0.05, y: -0.1, 
          onResolve({ finished }) {
            finished && PlayerState.notify('runStepRight'); 
          } 
        },
        { x: 0, y: 0 }
      ],
      loop: true,
      config: { duration: 150 }
    });
  }

  function aimStart() {
    zoomSpring.stop();
    zoomSpring.start({ zoom: 5, config: { mass: 2, friction: 25 } });
  }
  
  function aimEnd() {
    zoomSpring.stop();
    zoomSpring.start({ zoom: 0, config: { mass: 2, friction: 10, bounce: 0 } });
  }

  function shoot(data: NotifyData) {
    const knockback = data.knockback ?? 0.5
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
    aimStart,
    aimEnd,
    stopAnimation,
    get x() { return x.get() },
    get y() { return y.get() },
    get zoom() { return zoom.get() },
    get knockback() { return knockback.get() },
  }
}