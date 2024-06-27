import { create } from 'zustand'
import { Debug } from './debugState'
import { WEAPONS_DATA } from '../data'
import { playSound } from '../utils'
import * as THREE from 'three'
import { DataParameter, ObserversUnknownData } from './types'

export enum GunSubject {
  SHOT_FIRED = 'SHOT_FIRED',
  MAGAZINE_EMPTY = 'MAGAZINE_EMPTY',
  RELOAD_BEGIN = 'RELOAD_BEGIN',
  RELOAD_END = 'RELOAD_END',
}

export type ShotFiredData = { position: THREE.Vector3, damage: number, recoilZ?: number, recoilY?: number };

type Observers = ObserversUnknownData<GunSubject> & { 
  [GunSubject.SHOT_FIRED]: ((data: ShotFiredData) => void)[] 
};

//@ts-expect-error Properties from enum WorldSubject missing when they're clearly not
const initObservers: Observers = Object.fromEntries(
  Object.values(GunSubject).map(val => [val, []])
);

type GunState = {
  observers: Observers
  subscribe: <S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) => Function
  subscribeMany: <S extends keyof Observers>(subjects: [subject: S, cb: (data: DataParameter<Observers[S][0]>) => void][]) => Function
  unsubscribe: <S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) => void
  notify: <S extends keyof Observers>(subject: S, data?: DataParameter<Observers[S][1]>) => void

  decreaseAmmoInMag: () => void
  reloadBegin: () => void
  reloadEnd: () => void
} & GunStateStore;

export const GunState: GunState = {
  decreaseAmmoInMag: () => {
    useGunState.setState(({ ammoInMag }) => ({ ammoInMag: ammoInMag - 1 }));
  },
  reloadBegin() {
    if (this.reloading) return;
    
    GunState.notify(GunSubject.RELOAD_BEGIN);
    playSound('reload');
    useGunState.setState(({ magCapacity }) => ({ reloading: true, ammoInMag: magCapacity }));
  },
  reloadEnd() {
    if (!this.reloading) return;
    
    GunState.notify(GunSubject.RELOAD_END);
    useGunState.setState(() => ({ reloading: false }));
  },

  observers: initObservers,

  subscribe(subject, cb) {
      const newObservers = this.observers[subject];
      //@ts-expect-error Types of parameters 'data' and 'data' are incompatible
      newObservers.push(cb);

      this.observers = { ...this.observers, [subject]: newObservers };

      return () => {
        this.unsubscribe(subject, cb);
      };
  },
  subscribeMany(subjects) {
    subjects.forEach(entry => {
      this.subscribe(entry[0], entry[1]);
    });

    return () => {
      subjects.forEach(entry => {
        this.unsubscribe(entry[0], entry[1]);
      });
    };
  },
  unsubscribe(subject, cb) {
      const newObservers = this.observers[subject].filter(observers => observers !== cb);
      
      this.observers = { ...this.observers, [subject]: newObservers };
  },
  notify(subject, data) {
    try {
      this.observers[subject].forEach(observer => observer(data));
    } catch (e) {
      Debug.error(`[Gun state] Error notifying "${subject}" observers: ${e}`);
    }
  },

  get equipped() { return useGunState.getState().equipped },
  get damage() { return useGunState.getState().damage },
  get rateOfFire() { return useGunState.getState().rateOfFire },
  get magCapacity() { return useGunState.getState().magCapacity },
  get ammoInMag() { return useGunState.getState().ammoInMag },
  get recoilZ() { return useGunState.getState().recoilZ },
  get recoilY() { return useGunState.getState().recoilY },
  get weight() { return useGunState.getState().weight },
  get reloading() { return useGunState.getState().reloading }
};

type GunStateStore = {
  equipped: keyof typeof WEAPONS_DATA
  damage: number
  rateOfFire: number
  magCapacity: number
  ammoInMag: number
  recoilZ: number
  recoilY: number
  weight: number
  reloading: boolean
};

const smg = WEAPONS_DATA.smg;

export const useGunState = create<GunStateStore>(() => ({
  equipped: 'smg',
  damage: smg.damage,
  rateOfFire: smg.rateOfFire,
  magCapacity: smg.magCapacity,
  ammoInMag: smg.magCapacity,
  recoilZ: smg.recoilZ,
  recoilY: smg.recoilY,
  weight: smg.weight,
  reloading: false,
}));