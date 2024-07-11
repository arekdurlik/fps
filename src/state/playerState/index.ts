import { create } from 'zustand'
import { Debug } from '../debugState'
import { RefObject } from 'react'
import { RapierRigidBody, Vector3Object } from '@react-three/rapier'
import { DataParameter } from '../types'
import { Observers, PlayerSubject } from './types'

export type PlayerStateType = { [key: string]: unknown } & {
  velocity: Vector3Object
  observers: Observers
  subscribe: <S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) => Function
  subscribeMany: <S extends keyof Observers>(subjects: [subject: S, cb: (data: DataParameter<Observers[S][0]>) => void][]) => Function
  unsubscribe: <S extends keyof Observers>(subject: S, cb: (data: DataParameter<Observers[S][0]>) => void) => void
  notify: <S extends keyof Observers>(subject: S, data?: DataParameter<Observers[S][1]>) => void

  setVelocity: (velocity: Vector3Object) => void
  setPlayer: (player: RefObject<RapierRigidBody>) => void
  setStrafingLeft: (value?: boolean, notifyData?: {}) => void
  setStrafingRight: (value?: boolean, notifyData?: {}) => void
  setAiming: (value?: boolean) => void
  setIdling: (value?: boolean) => void
  setWalking: (value?: boolean) => void
  setRunning: (value?: boolean) => void
  setJumping: (value?: boolean, data?: { fall?: boolean }) => void
  setCanShoot: (value?: boolean) => void
} & PlayerStateStore;

//@ts-expect-error Properties from enum WorldSubject missing when they're clearly not
const initObservers: Observers = Object.fromEntries(
  Object.keys(PlayerSubject).map(key => [key, []])
);

function resetStates() {
  const state = usePlayerState.getState();
  state.idling  && Debug.log('Player state: Stopped idling', 'playerLeaveState');
  state.walking && Debug.log('Player state: Stopped walking', 'playerLeaveState');
  state.running && Debug.log('Player state: Stopped running', 'playerLeaveState');
  
  if (state.jumping) { 
    Debug.log('Player state: Stopped jumping', 'playerLeaveState');
    PlayerState.notify(PlayerSubject.JUMP_END);
  }

  usePlayerState.setState({ idling: false, walking: false, running: false, jumping: false });
}

export const PlayerState: PlayerStateType = {
  velocity: { x: 0, y: 0, z: 0 },

  setPlayer(player) {
    usePlayerState.setState({ player });
  },
  setVelocity(velocity: Vector3Object) {
    this.velocity = velocity;
  },
  setStrafingLeft(strafingLeft = true) {

    if (strafingLeft) {
      Debug.log('Player state: Strafing left', 'playerEnterState');
      PlayerState.notify(PlayerSubject.STRAFE_LEFT_BEGIN);
    } else {
      Debug.log('Player state: Stopped strafing left', 'playerEnterState');
      PlayerState.notify(PlayerSubject.STRAFE_LEFT_END);
    }

    usePlayerState.setState({ strafingLeft });
  },
  setStrafingRight(strafingRight = true) {

    if (strafingRight) {
      Debug.log('Player state: Strafing right', 'playerEnterState');
      PlayerState.notify(PlayerSubject.STRAFE_RIGHT_BEGIN);
    } else {
      Debug.log('Player state: Stopped strafing right', 'playerEnterState');
      PlayerState.notify(PlayerSubject.STRAFE_RIGHT_END);
    }

    usePlayerState.setState({ strafingRight });
  },
  setAiming(aiming = true) {
    if (aiming) {
      Debug.log('Player state: Aiming', 'playerEnterState');
      PlayerState.notify(PlayerSubject.AIM_BEGIN);
    }  else {
      Debug.log('Player state: Stopped aiming', 'playerLeaveState');
      PlayerState.notify(PlayerSubject.AIM_END);
    }

    usePlayerState.setState({ aiming });
  },
  setIdling(idling = true) {
    resetStates();

    if (idling) { 
      Debug.log('Player state: Idling', 'playerEnterState');
      PlayerState.notify(PlayerSubject.IDLE_BEGIN);
    }

    usePlayerState.setState({ idling });
  },
  setWalking(walking = true,) {
    resetStates();

    if (walking) {
      Debug.log('Player state: Walking', 'playerEnterState');
      PlayerState.notify(PlayerSubject.WALK_BEGIN);
    }

    usePlayerState.setState({ walking });
  },
  setRunning(running = true) {
    resetStates();

    if (running) {
      Debug.log('Player state: Running', 'playerEnterState');
      PlayerState.notify(PlayerSubject.RUN_BEGIN);
    }

    usePlayerState.setState({ running });
  },
  setJumping(jumping = true, data = { fall: false }) {
    resetStates();

    if (jumping) { 
      Debug.log('Player state: Jumping', 'playerEnterState');
      PlayerState.notify(PlayerSubject.JUMP_BEGIN, data);
    }

    usePlayerState.setState({ jumping });
  },
  setCanShoot(canShoot = true) {
    if (canShoot) { 
      Debug.log('Player state: Can shoot', 'playerEnterState');
    }

    usePlayerState.setState({ canShoot });
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
      //@ts-expect-error expected 0 arguments
      this.observers[subject].forEach(observer => observer(data));
    } catch (e) {
      Debug.error(`[Player state] Error notifying "${subject}" observers: ${e}`);
    }
  },

  get player() { return usePlayerState.getState().player },
  get aiming() { return usePlayerState.getState().aiming },
  get idling() { return usePlayerState.getState().idling },
  get walking() { return usePlayerState.getState().walking },
  get running() { return usePlayerState.getState().running },
  get jumping() { return usePlayerState.getState().jumping },
  get strafingLeft() { return usePlayerState.getState().strafingLeft },
  get strafingRight() { return usePlayerState.getState().strafingRight },
  get canShoot() { return usePlayerState.getState().canShoot },
};

type PlayerStateStore = {
  player: RefObject<RapierRigidBody> | null
  aiming: boolean
  idling: boolean
  walking: boolean
  running: boolean
  jumping: boolean
  strafingLeft: boolean
  strafingRight: boolean
  canShoot: boolean
};

export const usePlayerState = create<PlayerStateStore>(() => ({
  player: null,
  aiming: false,
  idling: false,
  walking: false,
  running: false,
  jumping: false,
  strafingLeft: false,
  strafingRight: false,
  canShoot: true
}));