import { useThree } from '@react-three/fiber'
import { useNextTickTexture } from '../hooks/useNextTickTexture'
import * as THREE from 'three'
import { WorldState } from '../state/worldState'
import { WorldSubject } from '../state/worldState/types'
import { useGLTF } from '@react-three/drei'

export function PreloadAssets() {
  const { scene } = useThree();

  // preload textures
  useNextTickTexture('guns/reticles.png');
  useNextTickTexture('guns/smg/body_stock.png');
  useNextTickTexture('guns/smg/body_reddot.png');
  useNextTickTexture('guns/smg/body_acog.png');
  useNextTickTexture('guns/smg/ironsight_stock.png');
  useNextTickTexture('guns/smg/ironsight_optic.png');
  useNextTickTexture('guns/smg/glass.png');
  useNextTickTexture('guns/smg/glass_acog.png');

  useGLTF.preload('guns/pip/acog.glb');

  // preload bulletholes
  function preloadBulletholes() {
    const plane = new THREE.Mesh(new THREE.PlaneGeometry(0, 0));
      plane.position.set(0, 1, -4);
      scene.add(plane);

      setTimeout(() => {
        WorldState.notify(WorldSubject.BULLET_IMPACT, { position: new THREE.Vector3(0, 1, -4), normal: new THREE.Vector3(0, 0, 1), object: plane })
        setTimeout(() => {
          scene.remove(plane);
          plane.geometry.dispose();
        }, 200);
      }, 200);
  }

  preloadBulletholes();

  return null;
}