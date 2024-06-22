import { create } from 'zustand'
import { Debug } from './consoleState'

const initObservers = {
  fallStart: [],
  jumpStart: [],
  jumpEnd: [],
  runStart: [],
  runEnd: [],
  walkStart: [],
  idleStart: [],

  aimStart: [],
  aimEnd: [],

  shotFired: [],

  walkStepLeft: [],
  walkStepRight: [],
  runStepLeft: [],
  runStepRight: [],

  strafeLeftStart: [],
  strafeLeftEnd: [],
  strafeRightStart: [],
  strafeRightEnd: [],
}

type PlayerState = {
  aiming: boolean
  idling: boolean
  walking: boolean
  running: boolean
  jumping: boolean
  strafingLeft: boolean
  strafingRight: boolean
  
  observers: { [key:string]: Function[] }
  subscribe: (subject: keyof typeof initObservers, cb: Function) => void
  unsubscribe: (subject: keyof typeof initObservers, cb: Function) => void
  notify: (subject: keyof typeof initObservers, data?: unknown) => void
}

type Subject = keyof typeof initObservers

function resetStates() {
  const state = usePlayerState.getState();
  state.idling  && Debug.log('Player state: Stopped idling', 'playerLeaveState');
  state.walking && Debug.log('Player state: Stopped walking', 'playerLeaveState');
  state.running && Debug.log('Player state: Stopped running', 'playerLeaveState');
  
  if (state.jumping) { 
    Debug.log('Player state: Stopped jumping', 'playerLeaveState');
    PlayerState.notify('jumpEnd');
  }

  usePlayerState.setState({ idling: false, walking: false, running: false, jumping: false });
}

// ease of use and getting state values in event callbacks
export const PlayerState = {
  setStrafingLeft: (strafingLeft = true, notifyData = {}) => {

    if (strafingLeft) {
      Debug.log('Player state: Strafing left', 'playerEnterState');
      PlayerState.notify('strafeLeftStart', notifyData);
    } else {
      Debug.log('Player state: Stopped strafing left', 'playerEnterState');
      PlayerState.notify('strafeLeftEnd', notifyData);
    }

    usePlayerState.setState({ strafingLeft });
  },
  setStrafingRight: (strafingRight = true, notifyData = {}) => {

    if (strafingRight) {
      Debug.log('Player state: Strafing right', 'playerEnterState');
      PlayerState.notify('strafeRightStart', notifyData);
    } else {
      Debug.log('Player state: Stopped strafing right', 'playerEnterState');
      PlayerState.notify('strafeRightEnd', notifyData);
    }

    usePlayerState.setState({ strafingRight });
  },
  setAiming: (aiming = true, notifyData = {}) => {
    if (aiming) {
      Debug.log('Player state: Aiming', 'playerEnterState');
      PlayerState.notify('aimStart', notifyData);
    }  else {
      Debug.log('Player state: Stopped aiming', 'playerLeaveState');
      PlayerState.notify('aimEnd', notifyData);
    }

    usePlayerState.setState({ aiming });
  },
  setIdling: (idling = true, notifyData = {}) => {
    resetStates();

    if (idling) { 
      Debug.log('Player state: Idling', 'playerEnterState');
      PlayerState.notify('idleStart', notifyData);
    }

    usePlayerState.setState({ idling });
  },
  setWalking: (walking = true, notifyData = {}) => {
    resetStates();

    if (walking) {
      Debug.log('Player state: Walking', 'playerEnterState');
      PlayerState.notify('walkStart', notifyData);
    }

    usePlayerState.setState({ walking });
  },
  setRunning: (running = true, notifyData = {}) => {
    resetStates();

    if (running) {
      Debug.log('Player state: Running', 'playerEnterState');
      PlayerState.notify('runStart', notifyData);
    }

    usePlayerState.setState({ running });
  },
  setJumping: (jumping = true, notifyData = {}) => {
    resetStates();

    if (jumping) { 
      Debug.log('Player state: Jumping', 'playerEnterState');
      PlayerState.notify('jumpStart', notifyData);
    }

    usePlayerState.setState({ jumping });
  },

  subscribe(subject: Subject, cb: Function) {
    usePlayerState.getState().subscribe(subject, cb);
  },
  unsubscribe(subject: Subject, cb: Function) {
    usePlayerState.getState().unsubscribe(subject, cb);
  },
  notify(subject: Subject, data?: unknown) {
    usePlayerState.getState().observers[subject].forEach(observer => observer(data));
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
  aiming: false,
  idling: false,
  walking: false,
  running: false,
  jumping: false,
  strafingLeft: false,
  strafingRight: false,

  
  
  observers: initObservers,
  subscribe: (subject: keyof typeof initObservers, cb: Function) => {
    set(state => {
      const newObservers = get().observers[subject];
      newObservers.push(cb);

      return { observers: { ...state.observers, subject: newObservers }};
    })
  },
  unsubscribe: (subject: string, cb: Function) => {
    set(state => {
      const newObservers = get().observers[subject].filter(observers => observers !== cb);
      
      return { observers: { ...state.observers, [subject]: newObservers }};
    })
  },
  notify: (subject: string, data?: unknown) => {
    try {
      get().observers[subject].forEach(observer => observer(data));
    } catch (e) {
      Debug.error(`[Player state] Error notifying "${subject}" observers: ${e}`);
    }
  }
}))