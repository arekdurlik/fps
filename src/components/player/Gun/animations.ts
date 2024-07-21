import { easings, useSpring } from '@react-spring/three'
import { useMouseVelocity } from '../../../hooks/useMouseVelocity'
import { clamp } from 'three/src/math/MathUtils.js'
import { Debug } from '../../../state/debugState'
import { PlayerState } from '../../../state/playerState'
import { SMG_OPTIC_PARAMS, SMG_PARAMS } from '../../../data'
import { randomFloat } from '../../../helpers'
import { GunState } from '../../../state/equipmentState/gunState'
import { ShotFiredData } from '../../../state/equipmentState/types'

export type GunAnimations = ReturnType<typeof useGunAnimations>;

export function useGunAnimations() {
  const mouseVelocity = useMouseVelocity();
  const [{ posX, posY }, positionSpring] = useSpring(() => ({ posX: 0.25, posY: 0 }));
  const [{ swayX, swayY }, swaySpring] = useSpring(() => ({ swayX: 0, swayY: 0 }));
  const [{ roll }, rollSpring] = useSpring(() => ({ roll: 0 }));
  const [{ velX, velY }, velocitySpring] = useSpring(() => ({ velX: 0, velY: 0 }));
  const [{ frame }, spriteSpring] = useSpring(() => ({ frame: 0 }));
  const [{ jumpY }, jumpSpring] = useSpring(() => ({ jumpY: 0 }));
  const [{ zoom } , zoomSpring] = useSpring(() => ({ zoom: 0 }));

  const [{ muzzleflash, knockback, recoilX, recoilY, kickX, kickY }, shootSpring] = useSpring(() => ({ muzzleflash: 0, knockback: 0, recoilX: 0, recoilY: 0, kickX: 0, kickY: 0 }));
  const [{ reloadX, reloadY }, reloadSpring] = useSpring(() => ({ reloadX: 0, reloadY: 0 }));

  function idle() {
    Debug.log('Gun animation: Idle', 'gunAnimation');

    swaySpring.stop();
    swaySpring.start({ swayX: 0, swayY: 0, 
      loop: true,
      config: { duration: 300 },
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
      config: { duration: 150 },
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
      velX: clamp(-mouseVelocity.current.x / 100, -0.1, 0.1), 
      velY: clamp(-mouseVelocity.current.y / 100, -0.1, 0.1),
      config: {
        friction: 30,
        mass: 2,
      }
    })
  }

  function aimBegin() {
    positionSpring.start({ posX: 0, posY: 0 });
    spriteSpring.start({
      to: [
        { frame: 1 },
        { frame: 2 },
      ],
      config: { duration: 70, easing: easings.steps(1), round: 1 }
    });
    zoomSpring.start({
      zoom: GunState.equipped.optic ? SMG_OPTIC_PARAMS[GunState.equipped.optic].zoom : SMG_PARAMS.zoom
    });
  }
  
  function aimEnd() {
    positionSpring.stop();
    positionSpring.start({ posX: 0.25, posY: 0 });
    
    spriteSpring.start({
      to: [
        { frame: 1 },
        { frame: 0 },
      ],
      config: { duration: 60, easing: easings.steps(1), round: 1 }
    });
    zoomSpring.start({
      zoom: 0
    });
  }
  
  function shoot({ recoilX, recoilY, kickX, kickY, knockback, muzzleFlash }: ShotFiredData) {
    Debug.log('Gun animation: Shoot', 'gunAnimation');
    
    shootSpring.stop();
    shootSpring.start({
      to: [
        { ...(muzzleFlash && { muzzleflash: randomFloat(0.5, 0.7), config: { duration: 0 }})},
        { ...(muzzleFlash && { muzzleflash: 0, config: { duration: 25 } })},
        { knockback, recoilX, recoilY, kickX, kickY, config: { duration: 20 }},
        { knockback: 0, recoilX: 0, recoilY: 0, kickX: 0, kickY: 0, config: { duration: 200 }}
      ]
    });
  }

  function rollLeft() {
    Debug.log('Gun animation: Roll left', 'gunAnimation');
    
    rollSpring.stop();
    rollSpring.start({
      roll: 0.075, config: { duration: 300, friction: 0 }
    })
  }
  
  function rollRight() {
    Debug.log('Gun animation: Roll right', 'gunAnimation');
    
    rollSpring.stop();
    rollSpring.start({
      roll: -0.075, config: { duration: 300, friction: 0 }
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

    spriteSpring.start({ frame: 0 });
    zoomSpring.start({ zoom: 0 });
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
    GunState.reloadEnd();
    
    reloadSpring.stop();
    reloadSpring.start({ reloadX: 0, reloadY: 0, config: { duration: 200 }, onResolve(result) {
      if (result.noop) return;

      PlayerState.setCanShoot();
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
    get recoilX() { return recoilX.get() },
    get recoilY() { return recoilY.get() },
    get kickX() { return kickX.get() },
    get kickY() { return kickY.get() },

    get jumpY() { return jumpY.get() },
    get velX() { return velX.get() },
    get velY() { return velY.get() },
    get swayX() { return swayX.get() },
    get swayY() { return swayY.get() },
    get roll() { return roll.get() },
    get frame() { return frame.get() },
    get zoom() { return zoom.get() }
  };
}