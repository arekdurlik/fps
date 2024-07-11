import * as THREE from 'three'
import { ObserversUnknownData } from '../types'

export enum WorldSubject {
  BULLET_IMPACT = 'BULLET_IMPACT',
  BULLET_CASING_COLLISION = 'BULLET_CASING_COLLISION',
}

/**
* @param position position of the impact
* @param normal normal direction of the impacted object's face
* @param object impacted object
*/
export type BulletImpactData = { position: THREE.Vector3, normal: THREE.Vector3, object: THREE.Object3D };
export type BulletCasingCollisionData = { id: number, position: THREE.Vector3Like };

export type Observers = ObserversUnknownData<WorldSubject> & { 
  [WorldSubject.BULLET_IMPACT]: ((data: BulletImpactData) => void)[] 
  [WorldSubject.BULLET_CASING_COLLISION]: ((data: BulletCasingCollisionData) => void)[] 
};