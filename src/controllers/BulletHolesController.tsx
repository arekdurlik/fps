import { useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { useNearestFilterTexture } from '../hooks/useNearestFilterTexture'
import * as THREE from 'three'
import { GunState, GunSubjects } from '../state/gunState'
import { GameState } from '../state/gameState'
import { invlerp } from '../helpers'
import { DecalGeometry } from 'three/examples/jsm/Addons.js'

const MAX_BULLETHOLES = 50;

const pos = new THREE.Vector3();
const dir = new THREE.Vector3();
const up = new THREE.Vector3(0, 0, 1);
const quaternion = new THREE.Quaternion();
const orientation = new THREE.Euler();
const mat = new THREE.MeshStandardMaterial({ 
  transparent: true,
  alphaTest: 0.5,
  polygonOffset: true,
  polygonOffsetFactor: -0.1,
  normalScale: new THREE.Vector2(0.3, 0.3)
});

export function BulletHolesController() {
  const map = useNearestFilterTexture('bullethole.png');
  const normalMap = useNearestFilterTexture('bullethole_normal.png');
  const bulletHoles = useRef<{ parent: THREE.Object3D, hole: THREE.Mesh }[]>([])
  const { raycaster, scene } = useThree();

  useEffect(() => {
    const unsubscribe = GunState.subscribe(GunSubjects.SHOT_FIRED, handleShotFired);
    return () => unsubscribe();
  }, [])

  function handleShotFired() {
    raycaster.set(GameState.camera.getWorldPosition(pos), GameState.camera.getWorldDirection(dir));

    const intersects = raycaster
      .intersectObjects(scene.children)
      .filter(int => int?.object?.userData.shootThrough ? false : true)
      .filter(int => int?.object?.type !== 'LineSegments'); // physics debug

    if (intersects.length === 0) return;

    const hit = intersects[0];

    // include sprite transparency

    /* function getImageData ( image ) {
      const canvas = document.createElement( 'canvas' )
      const context = canvas.getContext( `2d` )
      let { naturalWidth: w, naturalHeight: h } = image
      canvas.width = w
      canvas.height = h
      context!.drawImage( image, 0, 0, w, h )
      const imageData = context!.getImageData(0, 0, w, h);
      return imageData
    }

    for ( const intersect of intersects ) {
      const { object } = intersect
      // If the mesh type is sprite
      if ( object.type === `sprite` ) {
        // Get the image from the intersect object mesh
        const { image } = object.material.map
        // 2D ratio of where the mouse is on the image
        let { uv : { x : UX, y : UY } } = intersect

        // The actual w, h of the image
        let { width : OW, height : OH, src } = image
        // Get the image data, 
        const imageData = getImageData( image )
        // the X & Y of the image
        const x = Math.round( UX * OW )
        const y = OH - Math.round( UY * OH ) // reverse because threejs
        // the index of image data y is every row of pixels, x is on a row of pixels
        const I = ( x + y * OW ) * 4
        // the fourth (3) of every 4 numbers is the alpha value
        const A = imageData.data[ I + 3 ]
        // if A is 0 then it's transparent
        if ( A === 0 ) { continue }
      }
      hit = intersect; break
    } */
      
    if (hit) addBulletHole(hit.point, hit.face!.normal, hit.object);
  }

  function addBulletHole(position: THREE.Vector3, normal: THREE.Vector3, object: THREE.Object3D) {
    normal.transformDirection(object.matrixWorld);
    quaternion.setFromUnitVectors(up, normal);
    orientation.setFromQuaternion(quaternion);

    const decalGeometry = new DecalGeometry(object as THREE.Mesh, position, orientation, new THREE.Vector3(0.1, 0.1, 0.1));
    const mesh = new THREE.Mesh(decalGeometry, mat.clone());

    mesh.material.map = map;
    mesh.material.normalMap = normalMap;
    mesh.userData.shootThrough = true;
    mesh.receiveShadow = true;
    
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