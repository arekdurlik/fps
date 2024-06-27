/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Debug } from './debugState'
import * as THREE from 'three'
import { DataParameter, ObserversUnknownData } from './types'

export enum WorldSubject {
  BULLET_IMPACT = 'BULLET_IMPACT',
}

/**
* @param position position of the impact
* @param normal normal direction of the impacted object's face
* @param object impacted object
*/
export type BulletImpactData = { position?: THREE.Vector3, normal?: THREE.Vector3, object?: THREE.Object3D };

type Observers = ObserversUnknownData<WorldSubject> & { 
  [WorldSubject.BULLET_IMPACT]: ((data: BulletImpactData) => void)[] 
};

//@ts-expect-error Properties from enum WorldSubject missing they're clearly not
const initObservers: Observers = Object.fromEntries(
  Object.values(WorldSubject).map(val => [val, []])
);

type WorldState = {
  observers: Observers
  subscribe: <S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) => Function
  subscribeMany: <S extends keyof Observers>(subjects: [subject: S, cb: (data: DataParameter<Observers[S][0]>) => void][]) => Function
  unsubscribe: <S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) => void
  notify: <S extends keyof Observers>(subject: S, data?: DataParameter<Observers[S][1]>) => void
};

export const WorldState: WorldState = {
  observers: initObservers,

  subscribe(subject, cb) {
    const newObservers = this.observers[subject];
    //@ts-expect-error Types of parameters 'data' and 'data' are incompatible
    newObservers.push(cb);

    this.observers = { ...this.observers, [subject]: newObservers };

    return () => this.unsubscribe(subject, cb);
  },

  subscribeMany(subjects) {
    subjects.forEach(entry => {
      this.subscribe(entry[0], entry[1]);
    });

    return () => subjects.forEach(entry => this.unsubscribe(entry[0], entry[1]));
  },

  unsubscribe(subject, cb) {
    const newObservers = this.observers[subject].filter(observers => observers !== cb);
    
    this.observers = { ...this.observers, [subject]: newObservers };
  },

  notify(subject, data) {
    try {
      this.observers[subject].forEach(observer => observer(data!));
    } catch (e) {
      Debug.error(`[World state] Error notifying "${subject}" observers: ${e}`);
    }
  },
};

