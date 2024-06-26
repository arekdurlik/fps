import { create } from 'zustand'
import { Debug } from './debugState'
import { WEAPONS_DATA } from '../data'
import { playSound } from '../utils'

export enum GunSubject {
  SHOT_FIRED = 'SHOT_FIRED',
  MAGAZINE_EMPTY = 'MAGAZINE_EMPTY',
  RELOAD_BEGIN = 'RELOAD_BEGIN',
  RELOAD_END = 'RELOAD_END',
}

type Observers = { [key:string]: Function[] }
const initObservers: Observers = Object.fromEntries(
  Object.keys(GunSubject).map(key => [key, []])
);

// ease of use and getting state values in event callbacks
export const GunState = {
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

  subscribe(subject: GunSubject, cb: Function) {
      const newObservers = this.observers[subject];
      newObservers.push(cb);

      this.observers = { ...this.observers, subject: newObservers };

      return () => {
        this.unsubscribe(subject, cb);
      };
  },
  subscribeMany(subjects: [subject: GunSubject, cb: Function][]) {
    subjects.forEach(entry => {
      this.subscribe(entry[0], entry[1]);
    });

    return () => {
      subjects.forEach(entry => {
        this.unsubscribe(entry[0], entry[1]);
      });
    };
  },
  unsubscribe(subject: GunSubject, cb: Function) {
      const newObservers = this.observers[subject].filter(observers => observers !== cb);
      
      this.observers = { ...this.observers, [subject]: newObservers };
  },
  notify(subject: GunSubject, data?: unknown) {
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


type GunState = {
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

export const useGunState = create<GunState>(() => ({
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