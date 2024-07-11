import { ObserversUnknownData } from '../types'

export enum PlayerSubject {
  FALL_BEGIN = 'FALL_BEGIN',
  JUMP_BEGIN = 'JUMP_BEGIN',
  JUMP_END = 'JUMP_END',
  RUN_BEGIN = 'RUN_BEGIN',
  RUN_END = 'RUN_END',
  WALK_BEGIN = 'WALK_BEGIN',
  IDLE_BEGIN = 'IDLE_BEGIN',
  AIM_BEGIN = 'AIM_BEGIN',
  AIM_END = 'AIM_END',
  USE_EQUIPMENT = 'USE_EQUIPMENT',
  WALK_STEP_LEFT = 'WALK_STEP_LEFT',
  WALK_STEP_RIGHT = 'WALK_STEP_RIGHT',
  RUN_STEP_LEFT = 'RUN_STEP_LEFT',
  RUN_STEP_RIGHT = 'RUN_STEP_RIGHT',
  STRAFE_LEFT_BEGIN = 'STRAFE_LEFT_BEGIN',
  STRAFE_LEFT_END = 'STRAFE_LEFT_END',
  STRAFE_RIGHT_BEGIN = 'STRAFE_RIGHT_BEGIN',
  STRAFE_RIGHT_END = 'STRAFE_RIGHT_END',
}

export type RunStepLeftData = { firstStep: boolean };
export type JumpBeginData = { fall?: boolean };

// specify data for subject
export type Observers = ObserversUnknownData<PlayerSubject> & {
  [PlayerSubject.RUN_STEP_LEFT]: ((data: RunStepLeftData) => void)[]
  [PlayerSubject.JUMP_BEGIN]: ((data: JumpBeginData) => void)[]
}