/* eslint-disable  @typescript-eslint/no-explicit-any */
import { Debug } from '../debugState'
import { DataParameter } from '../types'
import { Observers, WorldSubject } from './types'

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
      //@ts-expect-error expected 0 arguments
      this.observers[subject].forEach(observer => observer(data));
    } catch (e) {
      Debug.error(`[World state] Error notifying "${subject}" observers: ${e}`);
    }
  },
};

