import { easings, useSpring } from '@react-spring/three'
import { useMouseVelocity } from '../../../hooks/useMouseVelocity'
import { clamp } from 'three/src/math/MathUtils.js'
import { Debug } from '../../../state/debugState'
import { NotifyData } from '../../../types'
import { GunState } from '../../../state/gunState'

export function useGunAnimations() {
  const mouseVelocity = useMouseVelocity();
  const [{ posX, posY }, positionSpring] = useSpring(() => ({ posX: 0.2, posY: 0 }));
  const [{ swayX, swayY }, swaySpring] = useSpring(() => ({ swayX: 0, swayY: 0 }));
  const [{ roll }, rollSpring] = useSpring(() => ({ roll: 0 }));
  const [{ velX, velY }, velocitySpring] = useSpring(() => ({ velX: 0, velY: 0 }));
  const [{ sprite }, spriteSpring] = useSpring(() => ({ sprite: 0 }));
  const [{ jumpY }, jumpSpring] = useSpring(() => ({ jumpY: 0 }));
  const [{ muzzleflash, knockback }, shootSpring] = useSpring(() => ({ muzzleflash: 0, knockback: 0 }));
  const [{ reloadX, reloadY }, reloadSpring] = useSpring(() => ({ reloadX: 0, reloadY: 0 }));

  function idle() {
    Debug.log('Gun animation: Idle', 'gunAnimation');

    swaySpring.stop();
    swaySpring.start({
      to: [
        { swayX: 0.001, swayY: 0, },
        { swayX: 0.0005, swayY: 0.0025, },
        { swayX: 0, swayY: 0.005 },
        { swayX: -0.00125, swayY: 0.0025 },
        { swayX: -0.0025, swayY: 0 },
        { swayX: -0.00125, swayY: -0.0025 },
        { swayX: 0, swayY: -0.005 },
        { swayX: 0.0025, swayY: -0.0025 },
        { swayX: 0.005, swayY: 0 },
        { swayX: 0.003, swayY: 0.0025 },
        { swayX: 0.001, swayY: 0.005 },
        { swayX: 0.0005, swayY: 0.0025 },
        { swayX: -0.001, swayY: 0 },
        { swayX: -0.0005, swayY: -0.0025 },
        { swayX: 0, swayY: -0.005 },
        { swayX: 0.0005, swayY: -0.0025 },
        { swayX: 0.001, swayY: 0 },
      ],
      loop: true,
      config: { duration: 300 }
    });
  }
  
  function run() {
    Debug.log('Gun animation: Run', 'gunAnimation');
    
    swaySpring.stop();
    swaySpring.start({
      to: [
        { swayX: 0.15, swayY: -0.225 },
        { swayX: 0.00, swayY: -0.3 },
        { swayX: -0.35, swayY: -0.275 },
        { swayX: 0.00, swayY: -0.3 }
      ],
      loop: true,
      config: { duration: 150 }
    });
  }
  
  function jumpBegin() {
    Debug.log('Gun animation: Jump', 'gunAnimation');
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

  function velocity() {
    velocitySpring.start({ 
      velX: clamp(-mouseVelocity.current.x / 3, -0.1, 0.1), 
      velY: clamp(-mouseVelocity.current.y / 3, -0.1, 0.1),
      config: {
        friction: 100,
        mass: 5
      }
    })
  }

  function aimBegin() {
    positionSpring.stop();
    positionSpring.start({ posX: 0, posY: 0 });
    spriteSpring.start({
      to: [
        { sprite: 1, config: { duration: 0 }},
        { sprite: 2, config: { duration: 75, easing: easings.steps(1), round: 1 }},
      ]
    })
  }

  function aimEnd() {
    positionSpring.stop();
    positionSpring.start({ posX: 0.2, posY: 0 });

    spriteSpring.start({
      to: [
        { sprite: 1, config: { duration: 0 }},
        { sprite: 0, config: { duration: 75, easing: easings.steps(1), round: 1}},
      ]
    })
  }

  function shoot() {
      shootSpring.start({ muzzleflash: 0.5, config: { duration: 0 }});
      shootSpring.start({
        to: [
          { knockback: 0.1, config: { duration: 50 }},
          { knockback: 0, muzzleflash: 0 }
        ]
      });
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

  // TODO: reload duration
  function reloadBegin() {
    const duration = 2000 as number;

    reloadSpring.stop();
    reloadSpring.start({
      to: [
        { reloadX: 0.15, reloadY: -0.3, config: { mass: 1 } },
        { reloadX: 0.15, reloadY: -0.3, delay: duration - 800 },
      ],
      config: { duration },
      onResolve(result) {
        if (result.noop) return;

        reloadEnd();
      }
    });
  }

  function reloadEnd() {
    reloadSpring.stop();
    reloadSpring.start({ reloadX: 0, reloadY: 0, config: { duration: 200 }, onResolve(result) {
      if (result.noop) return;

      GunState.reloadEnd();
    } });
  }
  
  function stopAnimation() {
    Debug.log('Gun animation: None', 'gunAnimation');

    positionSpring.stop();
    positionSpring.start({ posX: 0, posY: 0, config: { duration: 200 }});
  }

  return {
    idle,
    run,
    shoot,
    jumpBegin,
    jumpEnd,
    velocity,
    aimBegin,
    aimEnd,
    rollLeft,
    rollRight,
    rollEnd,
    reloadBegin,
    reloadEnd,
    stopAnimation,
    get posX() { return posX.get() },
    get posY() { return posY.get() },
    get reloadX() { return reloadX.get() },
    get reloadY() { return reloadY.get() },
    get knockback() { return knockback.get() },
    get muzzleflash() { return muzzleflash.get() },
    get jumpY() { return jumpY.get() },
    get velX() { return velX.get() },
    get velY() { return velY.get() },
    get swayX() { return swayX.get() },
    get swayY() { return swayY.get() },
    get roll() { return roll.get() },
    get sprite() { return sprite.get() },
  };
}