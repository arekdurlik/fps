import { useEffect, useRef } from 'react'
import { useNearestFilterTexture } from '../hooks/useNearestFilterTexture'
import * as THREE from 'three'
import { invlerp } from '../helpers'
import { DecalGeometry } from 'three/examples/jsm/Addons.js'
import { BulletImpactData, WorldState, WorldSubject } from '../state/worldState'

const MAX_BULLETHOLES = 50;

const up = new THREE.Vector3(0, 0, 1);
const quaternion = new THREE.Quaternion();
const orientation = new THREE.Euler();
const mat = new THREE.MeshStandardMaterial({ 
  transparent: true,
  depthWrite: false,
  polygonOffset: true,
  polygonOffsetFactor: -0.1,
  normalScale: new THREE.Vector2(0.3, 0.3)
});

export function BulletHoleController() {
  const map = useNearestFilterTexture('bullethole.png');
  const normalMap = useNearestFilterTexture('bullethole_normal.png');
  const bulletHoles = useRef<{ parent: THREE.Object3D, hole: THREE.Mesh }[]>([])
  
  useEffect(() => {
    const unsubscribe = WorldState.subscribe(WorldSubject.BULLET_IMPACT, addBulletHole)
    return () => unsubscribe();
  }, []);

  function addBulletHole({ position, normal, object }: BulletImpactData) {
    if (!position || !normal || !object) return;

    normal.transformDirection(object.matrixWorld);
    quaternion.setFromUnitVectors(up, normal);
    orientation.setFromQuaternion(quaternion);

    const decalGeometry = new DecalGeometry(object as THREE.Mesh, position, orientation, new THREE.Vector3(0.1, 0.1, 0.1));
    const mesh = new THREE.Mesh(decalGeometry, mat.clone());

    mesh.material.map = map;
    mesh.material.normalMap = normalMap;
    mesh.userData.shootThrough = true;
    mesh.receiveShadow = true;
    mesh.renderOrder = -1;
    
    object.worldToLocal(mesh.position);
    mesh.scale.divide(object.scale);
    mesh.rotation.setFromQuaternion(object.quaternion.clone().invert());
    
    object.add(mesh);
    bulletHoles.current.push({ parent: object, hole: mesh });

    // fade out oldest bulletholes and remove if over the limit
    bulletHoles.current.forEach((bh, index) => {

      const threshold = Math.min(20, MAX_BULLETHOLES);

      const opacity = invlerp(
        MAX_BULLETHOLES, 
        MAX_BULLETHOLES - threshold, 
        bulletHoles.current.length - index
      );
      
      if (opacity === 0) {
        bh.parent.remove(bh.hole);
        bh.hole.geometry.dispose();
        bulletHoles.current.splice(index, 1);
        return;
      }

      if (bh.hole.material instanceof THREE.Material) {
        bh.hole.material.opacity = opacity;
      }
    })
  }

  return null;
}