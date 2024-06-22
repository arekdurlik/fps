import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { useNearestFilterTexture } from '../../../hooks/useNearestFilterTexture'
import { useFrame } from '@react-three/fiber'
import { useGunEvents } from './events'
import { PlayerState, usePlayerState } from '../../../state/playerState'
import { playSound } from '../../../hooks/controllers/useAudioController'
import { GunState } from '../../../state/gunState'
import { WEAPONS_DATA } from '../../../data'

export function Gun() {
  const { gunAnimations } = useGunEvents();

  const texture = useNearestFilterTexture(WEAPONS_DATA[GunState.equipped].renderParams.texture);
  const muzzleflash = useNearestFilterTexture('muzzleflash.png');
  const reticleTexture = useNearestFilterTexture('reddot.png');
  const spriteAmount = 3;
  
  const muzzleflashMesh = useRef<THREE.Mesh>(null!);
  const gun = useRef<THREE.Group>(null!);
  const geom = useRef<THREE.PlaneGeometry>(null!);
  const gunWrapper = useRef<THREE.Group>(null!);
  const reticle = useRef<THREE.Mesh>(null!);
  const muzzleFlashLight = useRef<THREE.PointLight>(null!);
  
  const lastShotTimestamp = useRef(0);
  const aiming = usePlayerState(state => state.aiming);

  useEffect(() => {
    PlayerState.subscribe('shotFired', tryShoot);
    GunState.subscribe('shotFired', handleShotFired);
    GunState.subscribe('magazineEmpty', handleEmptyShotFired);
  }, [])

  useEffect(() => {
    if (!gun.current) return;

    gun.current.traverse(object => {
      object.userData.shootThrough = true;
    })
  }, [gun])

  function tryShoot() {
    if (Date.now() - lastShotTimestamp.current < GunState.rateOfFire) return;

    if (GunState.ammoInMag === 0) {
      GunState.notify('magazineEmpty');
    } else {
      GunState.decreaseAmmoInMag();
      GunState.notify('shotFired', {
        damage: GunState.damage,
        recoilZ: GunState.recoilZ,
        recoilY: GunState.recoilY,
      });
    }
  }
  
  function handleShotFired() {
    playSound('gunshot', 0.5);
    gunAnimations.shoot();
    lastShotTimestamp.current = Date.now();

    muzzleflashMesh.current.rotateZ(Math.random());
    const scale = Math.random() > 0.2 ? (0.3 + Math.random()) : 0;
    (muzzleflashMesh.current.material as THREE.MeshBasicMaterial).color = new THREE.Color(`#ff${['5', 'a', 'f'][Math.floor(Math.random() * 4)]}`);
    muzzleflashMesh.current.scale.set(scale, scale, scale);
  }

  function handleEmptyShotFired() {
    playSound('emptyGunshot', 0.3);
    lastShotTimestamp.current = Date.now();
  }

  useFrame(() => {
    gunAnimations.velocity();
  });

  // texture setup
  useEffect(() => {
    texture.repeat.set(1 / spriteAmount, 1);
  }, [])

  useEffect(() => {
    if (!geom.current) return;

    // make gun sprite normal face up so it at least get's lit up from above
    geom.current.attributes.normal.array.set([
      0, 1, 0, 
      0, 1, 0, 
      0, 1, 0, 
      0, 1, 0
    ]);

  }, [geom]);

  useFrame(() => {
    // reset
    gunWrapper.current.position.set(0, 0, 0);
    gunWrapper.current.rotation.set(0, 0, 0);
    reticle.current.position.set(0.00025, -0.00025, 0);
    reticle.current.rotation.set(0, 0, 0);
    muzzleflashMesh.current.position.setX(0);
    muzzleflashMesh.current.position.setY(0.02);

    // add gun animations
    gunWrapper.current.position.x += gunAnimations.posX / (aiming ? 10 : 1);
    gunWrapper.current.position.y += gunAnimations.posY / (aiming ? 10 : 1);

    gunWrapper.current.position.x += gunAnimations.reloadX;
    gunWrapper.current.rotation.z -= gunAnimations.reloadY * 1;
    gunWrapper.current.position.y += gunAnimations.reloadY;
    gunWrapper.current.position.z += gunAnimations.knockback;
    // add gun animations
    gunWrapper.current.position.x += gunAnimations.swayX / (aiming ? 10 : 1);
    gunWrapper.current.position.y += gunAnimations.swayY / (aiming ? 10 : 1);

    // add mouse velocity
    gunWrapper.current.position.x += gunAnimations.velX / (aiming ? 2 : 1);
    gunWrapper.current.position.y += gunAnimations.velY / (aiming ? 2 : 1);

    // add jump animation
    gunWrapper.current.position.y += gunAnimations.jumpY;

    // add roll
    gunWrapper.current.rotation.z += (gunAnimations.roll + (gunAnimations.velX / 2)) / (aiming ? 2 : 1);
    reticle.current.rotation.z += (gunAnimations.roll + (gunAnimations.velX / 2)) / 5;

    texture.offset.x = gunAnimations.sprite / spriteAmount;

    // reticle
    reticle.current.position.setZ(gunAnimations.sprite === 0 ? 5 : 0);
    reticle.current.position.x += gunAnimations.velX / 20
    reticle.current.position.y += gunAnimations.velY / 20
    reticle.current.position.x += gunAnimations.sprite === 1 ? 0.03  : 0
    reticle.current.position.y += gunAnimations.sprite === 1 ? -0.02 : 0

    // muzzle flash
    muzzleFlashLight.current.intensity = gunAnimations.muzzleflash;
    muzzleflashMesh.current.visible = gunAnimations.muzzleflash ? true : false;
    muzzleflashMesh.current.position.x -= gunAnimations.posX / 1.8;
    muzzleflashMesh.current.position.y += gunAnimations.posX * 0.2;
  });

  return <group ref={gun} name='gun' position={[0, -0.035, -0.175]} scale={0.23}>
      <pointLight castShadow ref={muzzleFlashLight} args={['#ddac62', 1, 10, 0]} position={[0, 0.2, -1]}/>
      <mesh ref={reticle}>
          <planeGeometry args={[1, 1, 1, 1]} />
          <meshBasicMaterial map={reticleTexture} color='#f00' transparent depthTest={false}/>
      </mesh>
      <group ref={gunWrapper}>
        <mesh receiveShadow>
          <planeGeometry args={[1, 1, 1, 1]} ref={geom}/>
          <meshLambertMaterial map={texture} transparent depthTest={false}/>
        </mesh>
        <mesh position={[0, 0.06, -0.01]} ref={muzzleflashMesh}>
          <planeGeometry args={[1, 1, 1, 1]} />
          <meshBasicMaterial map={muzzleflash} transparent  depthTest={false}/>
        </mesh>
      </group>  
    </group>
}