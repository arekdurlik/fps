import { create } from 'zustand'
import { Debug } from './debugState'
import { WEAPONS_DATA } from '../data'
import { playSound } from '../utils'
import * as THREE from 'three'
import { DataParameter, ObserversUnknownData } from './types'
import { Vector3Object } from '@react-three/rapier'

export enum GunSubject {
  SHOT_FIRED = 'SHOT_FIRED',
  MAGAZINE_EMPTY = 'MAGAZINE_EMPTY',
  RELOAD_BEGIN = 'RELOAD_BEGIN',
  RELOAD_END = 'RELOAD_END',
}

export type ShotFiredData = { eyePosition: THREE.Vector3, muzzlePosition: THREE.Vector3, direction: THREE.Vector3, velocity: Vector3Object, damage: number, recoilZ?: number, recoilY?: number };

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
  get weight() { return useGunState.getState().weight },
  get reloading() { return useGunState.getState().reloading },
  get recoilXMin() { return useGunState.getState().recoilXMin },
  get recoilXMax() { return useGunState.getState().recoilXMax },
  get recoilYMin() { return useGunState.getState().recoilYMin },
  get recoilYMax() { return useGunState.getState().recoilYMax },
  get kickXMin() { return useGunState.getState().kickXMin },
  get kickXMax() { return useGunState.getState().kickXMax },
  get kickYMin() { return useGunState.getState().kickYMin },
  get kickYMax() { return useGunState.getState().kickYMax },
  get spread() { return useGunState.getState().spread },
  get knockbackMin() { return useGunState.getState().knockbackMin },
  get knockbackMax() { return useGunState.getState().knockbackMax },
};

type GunStateStore = {
  equipped: keyof typeof WEAPONS_DATA
  damage: number
  rateOfFire: number
  magCapacity: number
  ammoInMag: number
  weight: number
  reloading: boolean
  recoilXMin: number,
  recoilXMax: number,
  recoilYMin: number,
  recoilYMax: number,
  kickXMin: number,
  kickXMax: number,
  kickYMin: number,
  kickYMax: number,
  spread: number,
  knockbackMin: number
  knockbackMax: number
  reticle: number
  reticleColor: string
};

const smg = WEAPONS_DATA.smg;

export const useGunState = create<GunStateStore>((set) => ({
  equipped: 'smg',
  reticle: 0,
  reticleColor: '#f00',
  reloading: false,
  ammoInMag: smg.magCapacity,
  ...smg,
  setValue(string: string, value: number) { set({ [string]: value })},
}));