import * as THREE from 'three'
import { Suspense, useEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGunEvents } from './events'
import { PlayerState, PlayerSubject } from '../../../state/playerState'
import { GunState, GunSubject, useGunState } from '../../../state/gunState'
import { SMG_BODY_SIGHT, SMG_BODY_STOCK, SMG_GLASS_REDDOT, WEAPONS_DATA } from '../../../data'
import { playSound } from '../../../utils'
import { GameState } from '../../../state/gameState'
import { RenderOrder } from '../../../constants'
import { randomNumber } from '../../../helpers'
import { Reticle } from './Reticle'
import { MuzzleFlash } from './MuzzleFlash'
import { IronSight } from './IronSight'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'

const up = new THREE.Vector3(0.0, 1.0, 0.0);
const spreadVec = new THREE.Vector3();
// make gun sprite normal face up so it get's lit up from above
const normalArray = new Uint8Array([0,1,0, 0,1,0, 0,1,0, 0,1,0]); 

export function Gun() {
  const { animations } = useGunEvents();
  const hasReticle = useGunState(state => state.reticle);
  const { texture: bodyTexture, setFrame: setBodyFrame } = useSpriteSheet(hasReticle ? SMG_BODY_SIGHT : SMG_BODY_STOCK, 128);
  const { texture: glassTexture, setFrame: setGlassFrame } = useSpriteSheet(SMG_GLASS_REDDOT, 128);
  const glassColor = useGunState(state => state.glassColor);
  
  const gunRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const muzzleRef = useRef<THREE.Group>(null!);
  
  const lastShotTimestamp = useRef(0);

  useEffect(() => {
    const playerUnsubscribe = PlayerState.subscribe(PlayerSubject.SHOT_FIRED, tryShoot);
    const gunUnsubscribe = GunState.subscribeMany([
      [GunSubject.SHOT_FIRED, handleShotFired],
      [GunSubject.MAGAZINE_EMPTY, handleEmptyShotFired]
    ]);

    return () => {
      playerUnsubscribe();
      gunUnsubscribe();
    }
  }, []);

  function tryShoot() {
    if (Date.now() - lastShotTimestamp.current < GunState.rateOfFire) return;

    if (GunState.ammoInMag === 0) {
      GunState.notify(GunSubject.MAGAZINE_EMPTY);
    } else {
      GunState.decreaseAmmoInMag();

      const spread = randomNumber(-animations.spread, animations.spread);
      spreadVec.set(spread, 0, spread);

      GunState.notify(GunSubject.SHOT_FIRED, {
        eyePosition: GameState.camera.getWorldPosition(new THREE.Vector3()),
        muzzlePosition: muzzleRef.current.getWorldPosition(new THREE.Vector3()),
        direction: GameState.camera.getWorldDirection(new THREE.Vector3()).add(spreadVec),
        velocity: PlayerState.velocity,
        damage: GunState.damage
      });
    }
  }
  
  function handleShotFired() {
    playSound('gunshot', 0.3);
    animations.shoot();
    lastShotTimestamp.current = Date.now();
  }

  function handleEmptyShotFired() {
    playSound('emptyGunshot', 0.3);
    lastShotTimestamp.current = Date.now();
  }

  useFrame((_, dt) => {
    const [gun, body, muzzle] = [gunRef.current, bodyRef.current, muzzleRef.current];
    
    // reset
    gun.rotation.set(0, 0, 0);
    body.position.set(0, 0, 0);
    body.rotation.set(0, 0, 0);
    
    // position
    body.position.x += animations.posX;
    body.position.y += animations.posY;
    
    // sway
    body.position.x += animations.swayX / (PlayerState.aiming ? 10 : 1);
    body.position.y += animations.swayY / (PlayerState.aiming ? 10 : 1);
    
    // mouse velocity
    animations.velocity();
    body.position.x += animations.velX / 1.5;
    body.position.y += animations.velY / 1.5;

    // roll
    gun.rotation.z += (animations.roll + (animations.velX * 2)) / (PlayerState.aiming ? 2 : 1);

    // reload
    body.position.x += animations.reloadX;
    body.rotation.z -= animations.reloadY;
    body.position.y += animations.reloadY;

    // jump
    body.position.y += animations.jumpY;
    
    // sprite
    setBodyFrame(animations.frame);
    setGlassFrame(animations.frame);

    // muzzle flash TODO: add to render params
    switch (animations.frame) {
      case 0: muzzle.position.x = -0.1; break;
      case 1: muzzle.position.x = -0.05; break;
      case 2: muzzle.position.x = 0; break;
    } 

    // recoil, kick, knockback - multiply recoil by dt to make it similar on different fps
    GameState.camera.rotateX(animations.recoilY * dt * 100);
    GameState.camera.rotateOnWorldAxis(up, animations.recoilX * dt * 100);
    body.position.x += animations.kickX;
    body.position.y += animations.kickY;
    gun.rotation.z += animations.kickX / 2;
    
    body.position.z += animations.knockback;
    
    gun.updateMatrix();
    body.updateMatrix();
  });

  return (
    <group ref={gunRef} position={[0, -0.035, -0.175]} scale={0.23} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>
      <group ref={bodyRef} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>

        <mesh receiveShadow renderOrder={RenderOrder.GUN_BODY} userData={{ shootThrough: true }}>
          <planeGeometry args={[1, 1, 1, 1]}>
            <bufferAttribute attach="attributes-normal" array={normalArray} itemSize={3} />
          </planeGeometry>
          <meshLambertMaterial map={bodyTexture} transparent depthTest={false}/>
        </mesh>

        {hasReticle && <mesh receiveShadow renderOrder={RenderOrder.GUN_BODY} userData={{ shootThrough: true }}>
          <planeGeometry args={[1, 1, 1, 1]}>
            <bufferAttribute attach="attributes-normal" array={normalArray} itemSize={3} />
          </planeGeometry>
          <meshLambertMaterial map={glassTexture} color={glassColor} transparent depthTest={false}/>
        </mesh>}

        <group ref={muzzleRef}>
          <MuzzleFlash animations={animations}/>
        </group>

      </group>  
      
      {hasReticle && <Reticle animations={animations}/>}
      <IronSight animations={animations}/>
    </group>
)}