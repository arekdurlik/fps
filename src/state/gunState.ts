import { create } from 'zustand'
import { Debug } from './debugState'
import { WEAPONS_DATA } from '../data'
import { playSound } from '../utils'

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

  observers: { [key:string]: Function[] }
  subscribe: (subject: Subject, cb: Function) => void
  unsubscribe: (subject: Subject, cb: Function) => void
  notify: (subject: Subject, data?: unknown) => void
}

type Subject = keyof typeof initObservers

export const GunSubjects = {
  SHOT_FIRED: 'SHOT_FIRED',
  MAGAZINE_EMPTY: 'MAGAZINE_EMPTY',
  RELOAD_BEGIN: 'RELOAD_BEGIN',
  RELOAD_END: 'RELOAD_END',
}

const initObservers = Object.fromEntries(
  Object.keys(GunSubjects).map(key => [key, []])
);

// ease of use and getting state values in event callbacks
export const GunState = {
  decreaseAmmoInMag: () => {
    useGunState.setState(({ ammoInMag }) => ({ ammoInMag: ammoInMag - 1 }));
  },
  reloadStart() {
    if (this.reloading) return;
    
    GunState.notify(GunSubjects.RELOAD_BEGIN);
    playSound('reload');
    useGunState.setState(({ magCapacity }) => ({ reloading: true, ammoInMag: magCapacity }));
  },
  reloadEnd() {
    if (!this.reloading) return;
    
    GunState.notify(GunSubjects.RELOAD_END);
    useGunState.setState(() => ({ reloading: false }));
  },
  subscribe(subject: Subject, cb: Function) {
    useGunState.getState().subscribe(subject, cb);
    return () => {
      this.unsubscribe(subject, cb);
    };
  },
  subscribeMany(subjects: [subject: Subject, cb: Function][]) {
    subjects.forEach(entry => {
      this.subscribe(entry[0], entry[1]);
    })

    return () => {
      subjects.forEach(entry => {
        this.unsubscribe(entry[0], entry[1]);
      });
    };
  },
  unsubscribe(subject: Subject, cb: Function) {
    useGunState.getState().unsubscribe(subject, cb);
  },
  notify(subject: Subject, data?: unknown) {
    try {
      useGunState.getState().notify(subject, data);
    } catch {
      throw new Error(`Subject "${subject}" not found in Gun subjects.`);
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
}

const smg = WEAPONS_DATA.smg;

export const useGunState = create<GunState>((set, get) => ({
  equipped: 'smg',
  damage: smg.damage,
  rateOfFire: smg.rateOfFire,
  magCapacity: smg.magCapacity,
  ammoInMag: smg.magCapacity,
  recoilZ: smg.recoilZ,
  recoilY: smg.recoilY,
  weight: smg.weight,
  reloading: false,

  observers: initObservers,
  subscribe: (subject: Subject, cb: Function) => {
    set(state => {
      const newObservers = get().observers[subject];
      newObservers.push(cb);

      return { observers: { ...state.observers, subject: newObservers }};
    })
  },
  unsubscribe: (subject: Subject, cb: Function) => {
    set(state => {
      const newObservers = get().observers[subject].filter(observers => observers !== cb);
      
      return { observers: { ...state.observers, [subject]: newObservers }};
    })
  },
  notify: (subject: Subject, data?: unknown) => {
    try {
      get().observers[subject].forEach(observer => observer(data));
    } catch (e) {
      Debug.error(`[Gun state] Error notifying "${subject}" observers: ${e}`);
    }
  }
}));