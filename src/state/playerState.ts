import { create } from 'zustand'
import { Debug } from './debugState'
import { RefObject } from 'react'
import { RapierRigidBody } from '@react-three/rapier'

type PlayerState = {
  player: RefObject<RapierRigidBody> | null

  aiming: boolean
  idling: boolean
  walking: boolean
  running: boolean
  jumping: boolean
  strafingLeft: boolean
  strafingRight: boolean
  
  observers: { [key:string]: Function[] }
  subscribe: (subject: Subject, cb: Function) => void
  unsubscribe: (subject: Subject, cb: Function) => void
  notify: (subject: Subject, data?: unknown) => void
}

type Subject = keyof typeof initObservers

export const PlayerSubjects = {
  FALL_BEGIN: 'FALL_BEGIN',
  JUMP_BEGIN: 'JUMP_BEGIN',
  JUMP_END: 'JUMP_END',
  RUN_BEGIN: 'RUN_BEGIN',
  RUN_END: 'RUN_END',
  WALK_BEGIN: 'WALK_BEGIN',
  IDLE_BEGIN: 'IDLE_BEGIN',
  AIM_BEGIN: 'AIM_BEGIN',
  AIM_END: 'AIM_END',
  SHOT_FIRED: 'SHOT_FIRED',
  WALK_STEP_LEFT: 'WALK_STEP_LEFT',
  WALK_STEP_RIGHT: 'WALK_STEP_RIGHT',
  RUN_STEP_LEFT: 'RUN_STEP_LEFT',
  RUN_STEP_RIGHT: 'RUN_STEP_RIGHT',
  STRAFE_LEFT_BEGIN: 'STRAFE_LEFT_BEGIN',
  STRAFE_LEFT_END: 'STRAFE_LEFT_END',
  STRAFE_RIGHT_BEGIN: 'STRAFE_RIGHT_BEGIN',
  STRAFE_RIGHT_END: 'STRAFE_RIGHT_END',
}

const initObservers = Object.fromEntries(
  Object.keys(PlayerSubjects).map(key => [key, []])
);

function resetStates() {
  const state = usePlayerState.getState();
  state.idling  && Debug.log('Player state: Stopped idling', 'playerLeaveState');
  state.walking && Debug.log('Player state: Stopped walking', 'playerLeaveState');
  state.running && Debug.log('Player state: Stopped running', 'playerLeaveState');
  
  if (state.jumping) { 
    Debug.log('Player state: Stopped jumping', 'playerLeaveState');
    PlayerState.notify(PlayerSubjects.JUMP_END);
  }

  usePlayerState.setState({ idling: false, walking: false, running: false, jumping: false });
}

// ease of use and getting state values in event callbacks
export const PlayerState = {
  setPlayer(player: RefObject<RapierRigidBody>) {
    usePlayerState.setState({ player });
  },
  setStrafingLeft(strafingLeft = true, notifyData = {}) {

    if (strafingLeft) {
      Debug.log('Player state: Strafing left', 'playerEnterState');
      PlayerState.notify(PlayerSubjects.STRAFE_LEFT_BEGIN, notifyData);
    } else {
      Debug.log('Player state: Stopped strafing left', 'playerEnterState');
      PlayerState.notify(PlayerSubjects.STRAFE_LEFT_END, notifyData);
    }

    usePlayerState.setState({ strafingLeft });
  },
  setStrafingRight(strafingRight = true, notifyData = {}) {

    if (strafingRight) {
      Debug.log('Player state: Strafing right', 'playerEnterState');
      PlayerState.notify(PlayerSubjects.STRAFE_RIGHT_BEGIN, notifyData);
    } else {
      Debug.log('Player state: Stopped strafing right', 'playerEnterState');
      PlayerState.notify(PlayerSubjects.STRAFE_RIGHT_END, notifyData);
    }

    usePlayerState.setState({ strafingRight });
  },
  setAiming(aiming = true, notifyData = {}) {
    if (aiming) {
      Debug.log('Player state: Aiming', 'playerEnterState');
      PlayerState.notify(PlayerSubjects.AIM_BEGIN, notifyData);
    }  else {
      Debug.log('Player state: Stopped aiming', 'playerLeaveState');
      PlayerState.notify(PlayerSubjects.AIM_END, notifyData);
    }

    usePlayerState.setState({ aiming });
  },
  setIdling(idling = true, notifyData = {}) {
    resetStates();

    if (idling) { 
      Debug.log('Player state: Idling', 'playerEnterState');
      PlayerState.notify(PlayerSubjects.IDLE_BEGIN, notifyData);
    }

    usePlayerState.setState({ idling });
  },
  setWalking(walking = true, notifyData = {}) {
    resetStates();

    if (walking) {
      Debug.log('Player state: Walking', 'playerEnterState');
      PlayerState.notify(PlayerSubjects.WALK_BEGIN, notifyData);
    }

    usePlayerState.setState({ walking });
  },
  setRunning(running = true, notifyData = {}) {
    resetStates();

    if (running) {
      Debug.log('Player state: Running', 'playerEnterState');
      PlayerState.notify(PlayerSubjects.RUN_BEGIN, notifyData);
    }

    usePlayerState.setState({ running });
  },
  setJumping(jumping = true, notifyData = {}) {
    resetStates();

    if (jumping) { 
      Debug.log('Player state: Jumping', 'playerEnterState');
      PlayerState.notify(PlayerSubjects.JUMP_BEGIN, notifyData);
    }

    usePlayerState.setState({ jumping });
  },

  subscribe(subject: Subject, cb: Function) {
    usePlayerState.getState().subscribe(subject, cb);
    return () => {
      return this.unsubscribe(subject, cb);
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
    usePlayerState.getState().unsubscribe(subject, cb);
  },
  notify(subject: Subject, data?: unknown) {
    try {
      usePlayerState.getState().observers[subject].forEach(observer => observer(data));
    } catch {
      throw new Error(`Subject "${subject}" not found in Player subjects.`);
    }
  },

  get aiming() { return usePlayerState.getState().aiming },
  get idling() { return usePlayerState.getState().idling },
  get walking() { return usePlayerState.getState().walking },
  get running() { return usePlayerState.getState().running },
  get jumping() { return usePlayerState.getState().jumping },
  get strafingLeft() { return usePlayerState.getState().strafingLeft },
  get strafingRight() { return usePlayerState.getState().strafingRight }
}

export const usePlayerState = create<PlayerState>((set, get) => ({
  player: null,
  aiming: false,
  idling: false,
  walking: false,
  running: false,
  jumping: false,
  strafingLeft: false,
  strafingRight: false,

  
  
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
      Debug.error(`[Player state] Error notifying "${subject}" observers: ${e}`);
    }
  }
}))