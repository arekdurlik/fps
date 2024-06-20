import { create } from 'zustand'
import { Debug } from './consoleState'

type PlayerState = {
  idling: boolean
  walking: boolean
  running: boolean
  jumping: boolean
  strafingLeft: boolean
  strafingRight: boolean
  setStrafingLeft: (value?: boolean) => void
  setStrafingRight: (value?: boolean) => void
  setIdling: (value?: boolean) => void
  setWalking: (value?: boolean) => void
  setRunning: (value?: boolean) => void
  setJumping: (value?: boolean) => void
  
  observers: { [key:string]: Function[] }
  subscribe: (subject: keyof typeof initObservers, cb: Function) => void
  unsubscribe: (subject: keyof typeof initObservers, cb: Function) => void
  notify: (subject: keyof typeof initObservers, data?: unknown) => void
}

const initObservers = {
  fallStart: [],
  jumpStart: [],
  jumpEnd: [],
  runStart: [],
  runEnd: [],
  walkStart: [],
  idleStart: [],
  strafeLeftStart: [],
  strafeLeftEnd: [],
  strafeRightStart: [],
  strafeRightEnd: [],
}

function resetStates() {
  const state = usePlayerState.getState();

  state.idling  && Debug.log('Player state: Stopped idling', 'playerLeaveState');
  state.walking && Debug.log('Player state: Stopped walking', 'playerLeaveState');
  state.running && Debug.log('Player state: Stopped running', 'playerLeaveState');
  state.jumping && Debug.log('Player state: Stopped jumping', 'playerLeaveState');

  usePlayerState.setState({ idling: false, walking: false, running: false, jumping: false });
}

export const PlayerState = {
  subscribe(subject: keyof typeof initObservers, cb: Function) {
    usePlayerState.getState().subscribe(subject, cb);
  },
  unsubscribe(subject: keyof typeof initObservers, cb: Function) {
    usePlayerState.getState().unsubscribe(subject, cb);
  }
}

export const usePlayerState = create<PlayerState>((set, get) => ({
  idling: false,
  walking: false,
  running: false,
  jumping: false,
  strafingLeft: false,
  strafingRight: false,
  setStrafingLeft: (strafingLeft = true) => {

    strafingLeft && Debug.log('Player state: Strafing left', 'playerEnterState');

    set({ strafingLeft });
  },
  setStrafingRight: (strafingRight = true) => {

    strafingRight &&Debug.log('Player state: Strafing right', 'playerEnterState');

    set({ strafingRight });
  },
  setIdling: (idling = true) => {
    resetStates();

    idling && Debug.log('Player state: Idling', 'playerEnterState');

    set({ idling });
  },
  setWalking: (walking = true) => {
    resetStates();

    walking && Debug.log('Player state: Walking', 'playerEnterState');

    set({ walking });
  },
  setRunning: (running = true) => {
    resetStates();

    running && Debug.log('Player state: Running', 'playerEnterState');

    set({ running });
  },
  setJumping: (jumping = true) => {
    resetStates();

    jumping && Debug.log('Player state: Jumping', 'playerEnterState');

    set({ jumping });
  },
  
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
    get().observers[subject].forEach(observer => observer(data));
  }
}))