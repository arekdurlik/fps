import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useNearestFilterTexture } from '../../../hooks/useNearestFilterTexture'
import { useFrame, useThree } from '@react-three/fiber'
import { useGunEvents } from './events'
import { PlayerState, PlayerSubject, usePlayerState } from '../../../state/playerState'
import { GunState, GunSubject } from '../../../state/gunState'
import { WEAPONS_DATA } from '../../../data'
import { playSound } from '../../../utils'
import { GameState } from '../../../state/gameState'
import { RenderOrder } from '../../../constants'

export function Gun() {
  const { animations } = useGunEvents();

  const texture = useNearestFilterTexture(WEAPONS_DATA[GunState.equipped].renderParams.texture);
  const reticleTexture = useNearestFilterTexture('reddot.png');
  const spriteAmount = 3;
  
  const muzzleflashMesh = useRef<THREE.Mesh>(null!);
  const gun = useRef<THREE.Group>(null!);
  const geom = useRef<THREE.PlaneGeometry>(null!);
  const gunWrapper = useRef<THREE.Group>(null!);
  const reticle = useRef<THREE.Mesh<THREE.PlaneGeometry, THREE.MeshBasicMaterial>>(null!);
  const muzzleFlashLight = useRef<THREE.PointLight>(null!);
  
  const lastShotTimestamp = useRef(0);
  const aiming = usePlayerState(state => state.aiming);

  // subscribe to events
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

  // texture setup
  useEffect(() => {
    texture.repeat.set(1 / spriteAmount, 1);
  }, []);

  // make gun sprite normal face up so it at least get's lit up from above
  useEffect(() => {
    geom.current.attributes.normal.array.set([
      0, 1, 0, 
      0, 1, 0, 
      0, 1, 0, 
      0, 1, 0
    ]);
  }, [geom]);

  function tryShoot() {
    if (Date.now() - lastShotTimestamp.current < GunState.rateOfFire) return;

    if (GunState.ammoInMag === 0) {
      GunState.notify(GunSubject.MAGAZINE_EMPTY);
    } else {
      GunState.decreaseAmmoInMag();
      GunState.notify(GunSubject.SHOT_FIRED, {
        position: muzzleflashMesh.current.getWorldPosition(new THREE.Vector3()),
        direction: GameState.camera.getWorldDirection(new THREE.Vector3()),
        velocity: PlayerState.velocity,
        damage: GunState.damage,
        recoilZ: GunState.recoilZ,
        recoilY: GunState.recoilY,
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

  // run velocity animation on every frame
  useFrame(() => {
    animations.velocity();
  });

  // apply animations
  useFrame(() => {
    // reset
    gunWrapper.current.position.set(0, 0, 0);
    gunWrapper.current.rotation.set(0, 0, 0);
    reticle.current.position.set(0.00025, -0.004, 0);
    reticle.current.rotation.set(0, 0, 0);
    muzzleflashMesh.current.position.setX(0);
    muzzleflashMesh.current.position.setY(0.02);

    // position
    gunWrapper.current.position.x += animations.posX / (aiming ? 10 : 1);
    gunWrapper.current.position.y += animations.posY / (aiming ? 10 : 1);

    // reload
    gunWrapper.current.position.x += animations.reloadX;
    gunWrapper.current.rotation.z -= animations.reloadY * 1;
    gunWrapper.current.position.y += animations.reloadY;

    gunWrapper.current.position.z += animations.knockback;

    // sway
    gunWrapper.current.position.x += animations.swayX / (aiming ? 10 : 1);
    gunWrapper.current.position.y += animations.swayY / (aiming ? 10 : 1);

    // mouse velocity
    gunWrapper.current.position.x += animations.velX / 1.5;
    gunWrapper.current.position.y += animations.velY / 1.5;
    /* if (aiming) gunWrapper.current.rotation.y += gunAnimations.velX / 2;
    if (aiming) gunWrapper.current.rotation.x -= gunAnimations.velY / 2; */

    // jump
    gunWrapper.current.position.y += animations.jumpY;

    // roll
    gunWrapper.current.rotation.z += (animations.roll + (animations.velX * 2)) / (aiming ? 2 : 1);

    // reticle
    reticle.current.rotation.z += gunWrapper.current.rotation.z;
    reticle.current.position.x += animations.roll / 15;
    reticle.current.position.x += animations.velX / 10;

    // sprite
    texture.offset.x = animations.sprite / spriteAmount;

    // reticle
    reticle.current.position.setZ(animations.sprite === 0 ? 5 : 0);
    reticle.current.material.opacity = animations.sprite === 1 ? 0.2 : 1;
    reticle.current.position.x += animations.velX / 20;
    reticle.current.position.y += animations.velY / 20;
    reticle.current.position.x += animations.sprite === 1 ? 0.03  : 0;
    reticle.current.position.y += animations.sprite === 1 ? -0.02 : 0;

    // muzzle flash
    muzzleFlashLight.current.intensity = animations.muzzleflash;
    muzzleflashMesh.current.visible = animations.muzzleflash ? true : false;
    muzzleflashMesh.current.position.x -= animations.posX / 1.8;
    muzzleflashMesh.current.position.y += animations.posX * 0.2;

    gunWrapper.current.updateMatrix();
    reticle.current.updateMatrix();
    muzzleflashMesh.current.updateMatrix();
  });

  return <group ref={gun} name='gun' position={[0, -0.035, -0.165]} scale={0.23}>
    <pointLight ref={muzzleFlashLight}  args={['#ddac62', 1, 10, 0]} position={[0, 0.2, -1]} castShadow/>
    <mesh ref={reticle} matrixAutoUpdate={false} matrixWorldAutoUpdate={false} userData={{ shootThrough: true }}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <meshBasicMaterial map={reticleTexture} color='#f00' transparent depthTest={false}/>
    </mesh>
    <group ref={gunWrapper} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>
      <mesh receiveShadow userData={{ shootThrough: true }} renderOrder={RenderOrder.GUN}>
        <planeGeometry ref={geom} args={[1, 1, 1, 1]}/>
        <meshLambertMaterial map={texture} transparent depthTest={false}/>
      </mesh>
      <mesh ref={muzzleflashMesh} position={[0, 0.06, 0]} matrixAutoUpdate={false} matrixWorldAutoUpdate={false} userData={{ shootThrough: true }}>
      </mesh>
    </group>  
  </group>
}