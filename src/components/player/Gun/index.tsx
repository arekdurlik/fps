import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGunEvents } from './events'
import { PlayerState } from '../../../state/playerState'
import { SMG_OPTIC_PARAMS, SMG_PARAMS } from '../../../data'
import { GameState } from '../../../state/gameState'
import { RenderOrder } from '../../../constants'
import { OpticReticle } from './OpticReticle'
import { MuzzleFlash } from './MuzzleFlash'
import { IronSight } from './IronSight'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'
import { Gun as GunType } from '../../../config/guns'
import { OpticGlass } from './OpticGlass'

const gunNormalArray = new Uint8Array([0,1,1, 0,1,1, 0,1,1, 0,1,1]);

const up = new THREE.Vector3(0, 1, 0);
const down = new THREE.Vector3(0, -1, 0);
const camDir = new THREE.Vector3();

export function Gun({ optic, attachments }: GunType) {
  const muzzleRef = useRef<THREE.Group>(null!);
  const gunRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const bodyMaterial = useRef<THREE.MeshLambertMaterial>(null!);

  const hasOptic = optic !== null;
  const { texture: bodyTexture, setFrame } = useSpriteSheet(hasOptic ? SMG_OPTIC_PARAMS[optic].body : SMG_PARAMS.body, 3, 1);
  const { animations } = useGunEvents(muzzleRef);
  
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
    setFrame(animations.frame);
    
    // muzzle flash TODO: add to render params
    switch (animations.frame) {
      case 0: muzzle.position.x = -0.1; break;
      case 1: muzzle.position.x = -0.05; break;
      case 2: muzzle.position.x = 0; break;
    } 
    
    // recoil, kick, knockback

    // prevent vertical recoil when looking straight up
    const RECOIL_THRESHOLD = 0.1;
    if (GameState.camera.getWorldDirection(camDir).angleTo(down) < Math.PI - RECOIL_THRESHOLD) {
      // multiply recoil by dt to make it similar on different fps
      GameState.camera.rotateX(animations.recoilY * dt * 100);
      GameState.camera.rotateOnWorldAxis(up, animations.recoilX * dt * 100);

      const cameraShake = PlayerState.aiming 
      ? animations.kickX * 2 
      : (-Math.abs(animations.kickX) * 3) + animations.kickX;

      GameState.cameraWrapper.rotation.z = cameraShake;
    }

    body.position.x += animations.kickX;
    body.position.y += animations.kickY;
    gun.rotation.z += animations.kickX / 2;
    
    body.position.z += animations.knockback * (PlayerState.aiming ? 3 : 1);
    body.position.y -= animations.knockback / 3;
    
    GameState.camera.setFocalLength(15 + animations.zoom - animations.knockback * 5);
    
    gun.updateMatrix();
    body.updateMatrix();
  });

  return (
    <group ref={gunRef} position={[0, -0.035, -0.165]} scale={0.23} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>
      <group ref={bodyRef} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>

        <mesh renderOrder={RenderOrder.GUN_BODY} userData={{ shootThrough: true }}>
          <planeGeometry args={[1, 1, 1, 1]}>
            <bufferAttribute attach="attributes-normal" array={gunNormalArray} itemSize={3} />
          </planeGeometry>
          <meshLambertMaterial ref={bodyMaterial} map={bodyTexture} transparent depthTest={false} />
        </mesh>


        <group ref={muzzleRef}>
          <MuzzleFlash animations={animations}/>
        </group>

        {optic && <OpticGlass optic={attachments.optics[optic]} animations={animations}/>}
      </group>  
      
      {optic && <OpticReticle optic={attachments.optics[optic]} animations={animations}/>}
      <IronSight hasOptic={hasOptic} animations={animations} normalArray={gunNormalArray}/>
    </group>
)}