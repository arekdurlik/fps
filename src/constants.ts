import { PointLight } from 'three'

// BULLETHOLES: -199 - MAX_BULLETHOLES
export enum RenderOrder {
  'SPRITE' = -200,
  'BULLETHOLES' = -199,
  'GUN_IRONSIGHT' = 999,
  'GUN_BODY' = 1000
}

export enum Collisions {
  'PLAYER' = 0,
  'WORLD' = 1,
  'BULLET_CASING' = 2
}

export const PHYSICS_FPS = 60;
export const PLAYER_INPUT_FPS = 60;
export const PARTICLES_FPS = 60;
export const BULLET_SPREAD_FPS = 30;

export enum EquipmentType {
  NONE = 'NONE',
  GUN = 'GUN'
}
