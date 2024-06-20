import { useSpring } from '@react-spring/three'
import { Debug } from '../../state/consoleState'
import { playSound } from '../controllers/useAudioController'

export function usePlayerAnimations() {
  const [{ x, y, fov }, spring] = useSpring(() => ({ x: 0, y: 0, fov: 20 }));

  function idle() {
    Debug.log('Player animation: Idle', 'playerAnimation');

    spring.stop();
    spring.start({ x: 0, y: 0, fov: 20,  config: { duration: 200 }});
  }

  function walk() {
    Debug.log('Player animation: Walk', 'playerAnimation');

    spring.stop();
    spring.start({
      to: [
        { x: -0.0125, y: -0.05, fov: 20, 
          onResolve({ finished }) {
            finished && playSound('walkL', 0.2);
          }  
        },
        { x: 0, y: 0 },
        { x: 0.0125, y: -0.05, 
          onResolve({ finished }) {
            finished && playSound('walkR', 0.2);
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
        { x: -0.05, y: -0.1, fov: 18, 
          onResolve({ finished }) {
            const volume = firstStep ? 0.2 : 0.4;
            finished && playSound('walkL', volume);
            firstStep = false;
          }  
        },
        { x: 0, y: 0 },
        { x: 0.05, y: -0.1, 
          onResolve({ finished }) {
            finished && playSound('walkR', 0.4);
          } 
        },
        { x: 0, y: 0 }
      ],
      loop: true,
      config: { duration: 150 }
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
    stopAnimation,
    get x() { return x.get() },
    get y() { return y.get() },
    get fov() { return fov.get() },
  }
}