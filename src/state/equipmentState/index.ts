import { create } from 'zustand'
import { Debug } from '../debugState'
import { DataParameter } from '../types'
import { defaultSmg, EquipmentItem, GunName } from '../../config/guns'
import update from 'immutability-helper';
import { GunOptic } from '../../config/gunAttachments'
import { EquipmentType } from '../../constants'
import { EquipmentSubject, GunStateType, NoneStateType, Observers } from './types'

//@ts-expect-error Properties from enum WorldSubject missing when they're clearly not
const initObservers: Observers = Object.fromEntries(
  Object.values(EquipmentSubject).map(val => [val, []])
);

export const EquipmentState = {
  setEquipped(index: number) {
    useEquipmentState.setState({ equippedIndex: index });
  },

  observers: initObservers,
  subscribe<S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) {
      const newObservers = this.observers[subject];
      //@ts-expect-error Types of parameters 'data' and 'data' are incompatible
      newObservers.push(cb);

      this.observers = { ...this.observers, [subject]: newObservers };

      return () => {
        this.unsubscribe(subject, cb);
      };
  },
  subscribeMany<S extends keyof Observers>(subjects: [subject: S, cb: (data: DataParameter<Observers[S][0]>) => void][]) {
    subjects.forEach(entry => {
      this.subscribe(entry[0], entry[1]);
    });

    return () => {
      subjects.forEach(entry => {
        this.unsubscribe(entry[0], entry[1]);
      });
    };
  },
  unsubscribe<S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) {
      const newObservers = this.observers[subject].filter(observers => observers !== cb);
      
      this.observers = { ...this.observers, [subject]: newObservers };
  },
  notify<S extends keyof Observers>(subject: S, data?: DataParameter<Observers[S][1]>) {
    try {
      //@ts-expect-error expected 0 arguments
      this.observers[subject].forEach(observer => observer(data));
    } catch (e) {
      Debug.error(`[Equipment state] Error notifying "${subject}" observers: ${e}`);
    }
  },

  get equippedIndex() { return useEquipmentState.getState().equippedIndex },
  get equipped() { return useEquipmentState.getState().computed.equipped },
  get slots() { return useEquipmentState.getState().slots },
};

export type EquipmentStateStore = {
 equippedIndex: number
 slots: EquipmentItem[]
} & (GunStateType | NoneStateType);

export const useEquipmentState = create<EquipmentStateStore>((_, get) => ({
  equippedIndex: 1,
  equippedType: EquipmentType.GUN,
  reloading: false,
  computed: {
    get equipped() { 
      return get().slots[get().equippedIndex]
    },
  },
  slots: [
    { 
      type: EquipmentType.NONE, 
      itemName: GunName.NONE
    },
    defaultSmg,
    update(defaultSmg, { optic: { $set: GunOptic.REFLEX }})
  ]
}));