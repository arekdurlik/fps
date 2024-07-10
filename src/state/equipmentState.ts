import { create } from 'zustand'
import { Debug } from './debugState'
import { DataParameter, ObserversUnknownData } from './types'
import { playSound } from '../utils'
import { defaultSmg, EquipmentItem, Gun, GunType } from '../config/guns'
import update from 'immutability-helper';
import { GunOptic } from '../config/gunAttachments'
import { Vector3Object } from '@react-three/rapier'
import * as THREE from 'three'
import { EquipmentType } from '../constants'

export enum EquipmentSubject {
  EQUIP_BEGIN = 'EQUIP_BEGIN',
  ITEM_SWAP = 'ITEM_SWAP',
  EQUIP_END = 'EQUIP_END',
  RELOAD_BEGIN = 'RELOAD_BEGIN',
  RELOAD_END = 'RELOAD_END',
  MAGAZINE_EMPTY = 'MAGAZINE_EMPTY',
  SHOT_FIRED = 'SHOT_FIRED'
}

export type ShotFiredData = { 
  eyePosition: THREE.Vector3, 
  muzzlePosition: THREE.Vector3, 
  direction: THREE.Vector3, 
  velocity: Vector3Object, 
  damage: number, 
  recoilX: number, 
  recoilY: number,
  kickX: number
  kickY: number
  knockback: number
  muzzleFlash: boolean
};

type Observers = ObserversUnknownData<EquipmentSubject> & { 
  [EquipmentSubject.SHOT_FIRED]: ((data: ShotFiredData) => void)[] 
};

//@ts-expect-error Properties from enum WorldSubject missing when they're clearly not
const initObservers: Observers = Object.fromEntries(
  Object.values(EquipmentSubject).map(val => [val, []])
);

type EquipmentState = {
  equippedIndex: number
  reloading: boolean
  equipped: EquipmentItem
  slots: EquipmentItem[]

  setEquipped: (item: number) => void
  
  decreaseAmmoInMag: () => void
  reloadBegin: () => void
  reloadEnd: () => void

  observers: Observers
  subscribe: <S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) => Function
  subscribeMany: <S extends keyof Observers>(subjects: [subject: S, cb: (data: DataParameter<Observers[S][0]>) => void][]) => Function
  unsubscribe: <S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) => void
  notify: <S extends keyof Observers>(subject: S, data?: DataParameter<Observers[S][1]>) => void
};

export const EquipmentState: EquipmentState = {
  setEquipped(index: number) {
    useEquipmentState.setState({ equippedIndex: index });
  },

  decreaseAmmoInMag: () => {
    const i = useEquipmentState.getState().equippedIndex;
    useEquipmentState.setState(({ slots }) => ({ slots: { ...slots, [i]: { ...slots[i], roundsLeft: (slots[i] as GunObject).roundsLeft - 1 }} }));
  },

  reloadBegin() {
    const i = useEquipmentState.getState().equippedIndex;
    EquipmentState.notify(EquipmentSubject.RELOAD_BEGIN);

    playSound('reload');
    useEquipmentState.setState(({ slots }) => ({ 
      slots: { ...slots, [i]: { ...slots[i], roundsLeft: (slots[i] as GunObject).roundsPerMag }},
      reloading: true
    }));
  },

  reloadEnd() {
    EquipmentState.notify(EquipmentSubject.RELOAD_END);
    useEquipmentState.setState(() => ({ 
      reloading: false
    }));
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
      this.observers[subject].forEach(observer => observer(data!));
    } catch (e) {
      Debug.error(`[Equipment state] Error notifying "${subject}" observers: ${e}`);
    }
  },

  get equippedIndex() { return useEquipmentState.getState().equippedIndex },
  get equipped() { return useEquipmentState.getState().computed.equipped },
  get reloading() { return useEquipmentState.getState().reloading },
  get slots() { return useEquipmentState.getState().slots },
};

type EquipmentStateStore = {
  equippedIndex: number
  reloading: boolean
  computed: {
    equipped: EquipmentItem
  }
  slots: EquipmentItem[]
};

export const useEquipmentState = create<EquipmentStateStore>((set, get) => ({
  equippedIndex: 1,
  reloading: false,
  computed: {
    get equipped() { return get().slots[get().equippedIndex] }
  },
  slots: [
    { 
      type: EquipmentType.NONE, 
      item: GunType.NONE
    },
    defaultSmg,
    update(defaultSmg, { optic: { $set: GunOptic.REFLEX }})
  ]
}));