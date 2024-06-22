import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useNearestFilterTexture } from '../useNearestFilterTexture'
import * as THREE from 'three'
import { GunState } from '../../state/gunState'
import { GameState } from '../../state/gameState'
import { invlerp } from '../../helpers'

const MAX_BULLETHOLES = 50;

const pos = new THREE.Vector3();
const dir = new THREE.Vector3();
const mat = new THREE.MeshStandardMaterial({ 
  transparent: true,
  depthWrite: false,
  
  alphaTest: 0.1,
  blending: THREE.CustomBlending,
  blendEquationAlpha: THREE.AddEquation,
  polygonOffset: true,
  polygonOffsetFactor: -0.1
});
const geom = new THREE.PlaneGeometry(0.075, 0.075);

export function useBulletHolesController() {
  const texture = useNearestFilterTexture('bullethole.png');
  const { raycaster, scene } = useThree();
  const bulletHoles = useRef<{ parent: THREE.Object3D, hole: THREE.Mesh }[]>([])

  useEffect(() => {
    GunState.subscribe('shotFired', handleShotFired);
  }, [])

  function handleShotFired() {

    raycaster.set(GameState.camera.getWorldPosition(pos), GameState.camera.getWorldDirection(dir));

    const intersects = raycaster
      .intersectObjects(scene.children)
      .filter(int => int?.object?.userData.shootThrough ? false : true)
      .filter(int => int?.object?.type !== 'LineSegments'); // physics debug

    if (intersects.length === 0) return;
      
    const hit = intersects[0];

    addBulletHole(hit.point, hit.face!.normal, hit.object);
  }

  function addBulletHole(position: THREE.Vector3, normal: THREE.Vector3, object: THREE.Object3D) {

    const mesh = new THREE.Mesh(geom, mat.clone());
    mesh.renderOrder = 1;
    mesh.material.map = texture;
    mesh.userData.shootThrough = true;

    // randomize scale
    const rand = Math.random() * 0.4;
    mesh.scale.setX(1 / object.scale.x + rand);
    mesh.scale.setY(1 / object.scale.y + rand);
    mesh.scale.setZ(1 / object.scale.z + rand);

    const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    mesh.position.copy(position);
    mesh.quaternion.copy(quaternion);
    mesh.updateMatrix();
    object.worldToLocal(mesh.position);

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
        bulletHoles.current.splice(index, 1);
        return;
      }

      if (bh.hole.material instanceof THREE.Material) {
        bh.hole.material.opacity = opacity;
      }
    })
  }

  return { addBulletHole };
}