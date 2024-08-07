import * as THREE from 'three'
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGunEvents } from './events'
import { PlayerState } from '../../../state/playerState'
import { SMG_OPTIC_PARAMS, SMG_PARAMS } from '../../../data'
import { GameState } from '../../../state/gameState'
import { Layers, RenderOrder } from '../../../constants'
import { OpticReticle } from './OpticReticle'
import { MuzzleFlash } from './MuzzleFlash'
import { IronSight } from './IronSight'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'
import { Gun as GunType } from '../../../config/guns'
import { OpticGlass } from './OpticGlass'
import { PIPScope } from './PIPScope'
import { GunOptic } from '../../../config/gunAttachments'

const gunNormalArray = new Uint8Array([0,1,1, 0,1,1, 0,1,1, 0,1,1]);

const up = new THREE.Vector3(0, 1, 0);
const down = new THREE.Vector3(0, -1, 0);
const camDir = new THREE.Vector3();

export function Gun({ optic, attachments }: GunType) {
  const muzzleRef = useRef<THREE.Group>(null!);
  const gunRef = useRef<THREE.Group>(null!);
  const bodyRef = useRef<THREE.Group>(null!);
  const bodyMaterial = useRef<THREE.MeshStandardMaterial>(null!);

  const hasOptic = optic !== null;
  const { texture: bodyTexture, setFrame } = useSpriteSheet(hasOptic ? SMG_OPTIC_PARAMS[optic].body : SMG_PARAMS.body, 3, 1);
  const { animations } = useGunEvents(muzzleRef);
  
  useFrame(({ clock }, dt) => {
    const [gun, body, muzzle] = [gunRef.current, bodyRef.current, muzzleRef.current];
    
    // reset
    gun.position.set(0, 0, -0.165);
    gun.rotation.set(0, 0, 0);
    body.position.set(0, 0, 0);
    body.rotation.set(0, 0, 0);
    
    // position
    body.position.x += animations.posX;
    body.position.y += animations.posY;
    
    // sway TODO: move to gun animations
    body.position.x += animations.swayX / (PlayerState.aiming ? 3 : 1);
    body.position.y += animations.swayY / (PlayerState.aiming ? 3 : 1);
    body.position.x += Math.sin(1 + clock.getElapsedTime() * 3) * 0.0015;
    body.position.x -= Math.sin(2 + clock.getElapsedTime()) * 0.0015;
    body.position.y -= Math.sin(3 + clock.getElapsedTime()) * 0.004;
    body.position.y += Math.sin(4 + clock.getElapsedTime() * 2) * 0.0025;
    
    // mouse velocity
    animations.velocity();
    body.position.x += animations.velX / 1.5;
    body.position.y += animations.velY / (PlayerState.aiming ? 1.5 : 4);

    // roll
    gun.rotation.z += (animations.roll + (animations.velX * (PlayerState.aiming ? 2 : 3))) / 2;

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
      case 0: {
        muzzle.position.x = -0.1; 
        gun.scale.set(0.2, 0.2, 0.2);
        gun.position.y -= 0.042;
        break;
      }
      case 1: {
        muzzle.position.x = -0.05; 
        gun.scale.set(0.225, 0.225, 0.225); 
        gun.position.y -= 0.038;
        break;
      }
      case 2: {
        muzzle.position.x = 0; 
        gun.scale.set(0.25, 0.25, 0.25); 
        gun.position.y -= 0.038;
        break;
      }
    } 
    
    // recoil, kick, knockback, camera shake

    // prevent vertical recoil when looking straight up
    const RECOIL_THRESHOLD = 0.1;
    if (GameState.camera.getWorldDirection(camDir).angleTo(down) < Math.PI - RECOIL_THRESHOLD) {
      // multiply recoil by dt to make it similar on different fps
      GameState.camera.rotateX(animations.recoilY * dt * 100);
      GameState.camera.rotateOnWorldAxis(up, animations.recoilX * dt * 100);

      const cameraShake = PlayerState.aiming 
      ? animations.kickX * 4 
      : (-Math.abs(animations.kickX) * 3) + animations.kickX * 2;

      GameState.cameraWrapper.rotation.set(0, 0, 0);
      GameState.cameraWrapper.rotateOnWorldAxis(camDir, cameraShake);
    }

    body.position.x += animations.kickX;
    body.position.y += animations.kickY;
    gun.rotation.z += animations.kickX * 3;
    
    body.position.z += animations.knockback * (PlayerState.aiming ? 3 : 1);
    body.position.y += animations.knockback / 0.5;
    gun.rotation.x += animations.knockback* 4;
    
    GameState.camera.setFocalLength(15 + animations.zoom + animations.knockback * 5);
    
    gun.updateMatrix();
    body.updateMatrix();
  });

  return (
    <>
    {optic === GunOptic.ACOG  && <PIPScope animations={animations}/>}
      <group dispose={null} ref={gunRef} scale={0.23} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>
        <group dispose={null} ref={bodyRef} matrixAutoUpdate={false} matrixWorldAutoUpdate={false}>

          <mesh dispose={null} receiveShadow renderOrder={RenderOrder.GUN_BODY} userData={{ shootThrough: true }} layers={Layers.GUN}>
            <planeGeometry args={[1, 1, 1, 1]}>
              <bufferAttribute attach="attributes-normal" array={gunNormalArray} itemSize={3} />
            </planeGeometry>
            <meshStandardMaterial ref={bodyMaterial} map={bodyTexture} transparent depthTest={false}/>
          </mesh>
          
          <group dispose={null} ref={muzzleRef} position={[0, 0, -0.1]}>
            <MuzzleFlash animations={animations}/>
          </group>

          {optic && <OpticGlass optic={attachments.optics[optic]} animations={animations}/>}
        </group>  
        
        {optic && <OpticReticle optic={attachments.optics[optic]} animations={animations}/>}
        <IronSight hasOptic={hasOptic} animations={animations} normalArray={gunNormalArray}/>
      </group>
    </>
)}