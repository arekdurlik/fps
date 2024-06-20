import { useSpring } from '@react-spring/three'
import { useMouseVelocity } from '../useMouseVelocity'
import { clamp } from 'three/src/math/MathUtils.js'
import { Debug } from '../../state/consoleState'

export function useGunAnimations() {
  const mouseVelocity = useMouseVelocity();
  const [{ x, y }, spring] = useSpring(() => ({ x: 0, y: 0 }));
  const [{ roll }, rollSpring] = useSpring(() => ({ roll: 0 }));
  const [{ velX, velY }, swaySpring] = useSpring(() => ({ velX: 0, velY: 0 }));
  const [{ jumpY }, jumpSpring] = useSpring(() => ({ jumpY: 0}));
  
  function idle() {
    Debug.log('Gun animation: Idle', 'gunAnimation');
    
    spring.stop();
    spring.start({
      to: [
        { x: 0.001, y: 0, },
        { x: 0.0005, y: 0.0025, },
        { x: 0, y: 0.005 },
        { x: -0.00125, y: 0.0025 },
        { x: -0.0025, y: 0 },
        { x: -0.00125, y: -0.0025 },
        { x: 0, y: -0.005 },
        { x: 0.0025, y: -0.0025 },
        { x: 0.005, y: 0 },
        { x: 0.003, y: 0.0025 },
        { x: 0.001, y: 0.005 },
        { x: 0.0005, y: 0.0025 },
        { x: -0.001, y: 0 },
        { x: -0.0005, y: -0.0025 },
        { x: 0, y: -0.005 },
        { x: 0.0005, y: -0.0025 },
        { x: 0.001, y: 0 },
  
      ],
      loop: true,
      config: { duration: 300 }
    });
    
  }
  
  function run() {
    Debug.log('Gun animation: Run', 'gunAnimation');
    
    spring.stop();
    spring.start({
      to: [
        { x: 0.15, y: -0.225 },
        { x: 0.00, y: -0.3 },
        { x: -0.35, y: -0.275 },
        { x: 0.00, y: -0.3 }
      ],
      loop: true,
      config: { duration: 150 }
    });
  }
  
  function jumpStart() {
    jumpSpring.start({
      to: [
        { jumpY: 0.05, config: { duration: 150} },
        { jumpY: -0.02, config: { duration: 600, friction: 0 } },
      ],
    });
  }

  function jumpEnd() {
    Debug.log('Gun animation: Jump end', 'gunAnimation');
    
    jumpSpring.start({
      to: [
        { jumpY: -0.05 },
        { jumpY: 0, config: { duration: 250 }},
      ],
      config: {
        friction: 0,
        bounce: 0,
        mass: 0.5,
      }
    });
  }

  function hipSway() {
    swaySpring.start({ 
      velX: clamp(-mouseVelocity.current.x / 3, -0.1, 0.1), 
      velY: clamp(-mouseVelocity.current.y / 3, -0.1, 0.1),
      config: {
        friction: 100,
        mass: 5
      }
    })
  }

  function stopAnimation() {
    Debug.log('Gun animation: None', 'gunAnimation');

    spring.stop();
    spring.start({ x: 0, y: 0, config: { duration: 200 }});
  }

  function rollLeft() {
    Debug.log('Gun animation: Roll left', 'gunAnimation');

    rollSpring.stop();
    rollSpring.start({
      roll: 0.1, config: { duration: 300, friction: 0 }
    })
  }

  function rollRight() {
    Debug.log('Gun animation: Roll right', 'gunAnimation');

    rollSpring.stop();
    rollSpring.start({
      roll: -0.1, config: { duration: 300, friction: 0 }
    })
  }
  
  function rollEnd() {
    Debug.log('Gun animation: Roll end', 'gunAnimation');

    rollSpring.stop();
    rollSpring.start({
      roll: 0, config: { duration: 300, friction: 0 }
    })
  }

  return {
    idle,
    run,
    jumpStart,
    jumpEnd,
    hipSway,
    stopAnimation,
    rollLeft,
    rollRight,
    rollEnd,
    get x() { return x.get() },
    get y() { return y.get() },
    get jumpY() { return jumpY.get() },
    get velX() { return velX.get() },
    get velY() { return velY.get() },
    get roll() { return roll.get() },
  }
}