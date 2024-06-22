import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useNearestFilterTexture } from '../useNearestFilterTexture'
import * as THREE from 'three'
import { GunState } from '../../state/gunState'
import { GameState } from '../../state/gameState'

const MAX_BULLETHOLES = 1000;

const pos = new THREE.Vector3();
const dir = new THREE.Vector3();

export function useBulletHolesController() {
  const texture = useNearestFilterTexture('bullethole.png');
  const { raycaster, scene } = useThree();
  const bulletHoleGroups = useRef(new Map());

  useEffect(() => {
    GunState.subscribe('shotFired', handleShotFired);
  }, [])

  function handleShotFired() {
    const camera = GameState.camera;
    
    if (!camera) return;

    raycaster.set(camera.getWorldPosition(pos), camera.getWorldDirection(dir));

    const intersects = raycaster
      .intersectObjects(scene.children)
      .filter(int => int?.object?.userData.shootThrough ? false : true)
      .filter(int => int?.object?.type !== 'LineSegments'); // physics debug

    if (intersects.length === 0) return;
      
    const hit = intersects[0];

    setTimeout(() => { addBulletHole(hit.point, hit.face!.normal, hit.object);});
  }

  function addBulletHole(position: THREE.Vector3, normal: THREE.Vector3, object: THREE.Object3D) {
      let instancedMesh = bulletHoleGroups.current.get(object);
      if (!instancedMesh) {
        instancedMesh = createInstancedMesh(MAX_BULLETHOLES, texture);
        object.add(instancedMesh);
        bulletHoleGroups.current.set(object, { instancedMesh, index: 0 });
      }
      
      const { instancedMesh: mesh, index } = bulletHoleGroups.current.get(object);

      const inverseMatrix = new THREE.Matrix4().copy(object.matrixWorld).invert();
      const localPosition = position.clone().applyMatrix4(inverseMatrix);

      const dummy = new THREE.Object3D();
      dummy.scale.set(0.5, 0.5, 0.5);

      const quaternion = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
      dummy.position.copy(localPosition);
      dummy.quaternion.copy(quaternion);
      dummy.updateMatrix();

      mesh.setMatrixAt(index, dummy.matrix);
      mesh.instanceMatrix.needsUpdate = true;

      bulletHoleGroups.current.set(object, { instancedMesh: mesh, index: (index + 1) % MAX_BULLETHOLES });
  }

  const createInstancedMesh = (count: number, texture: THREE.Texture) => {
    const geometry = new THREE.PlaneGeometry(0.2, 0.2);
    const material = new THREE.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, alphaTest: 0.1, polygonOffset: true, polygonOffsetFactor: -0.05 });
    const mesh = new THREE.InstancedMesh(geometry, material, count);
    mesh.frustumCulled = false;

    // initialize bullethole scale to 0
    const dummy = new THREE.Object3D();
    dummy.scale.set(0, 0, 0);
    dummy.updateMatrix();
    for (let i = 0; i <= MAX_BULLETHOLES; i++) {
      mesh.setMatrixAt(i, dummy.matrix);
    } 
    return mesh;
  };

  return { addBulletHole };
}