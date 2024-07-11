import * as THREE from 'three'
import { EquipmentStateStore } from '.'
import { EquipmentItem } from '../../config/guns'
import { EquipmentType } from '../../constants'
import { ObserversUnknownData } from '../types'

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
  velocity: THREE.Vector3Like, 
  damage: number, 
  recoilX: number, 
  recoilY: number,
  kickX: number
  kickY: number
  knockback: number
  muzzleFlash: boolean
};

export type Observers = ObserversUnknownData<EquipmentSubject> & { 
  [EquipmentSubject.SHOT_FIRED]: ((data: ShotFiredData) => void)[] 
};

export type EquipmentStatePartial = EquipmentStateStore 
  | Partial<EquipmentStateStore> 
  | ((state: EquipmentStateStore) => EquipmentStateStore 
  | Partial<EquipmentStateStore>);

export type GunStateType = {
  equippedType: EquipmentType.GUN,
  reloading: boolean,
  computed: {
    equipped: EquipmentItem
  }
};
  
export type NoneStateType = {
  equippedType: EquipmentType.NONE,
  computed: {
    equipped: EquipmentItem
  }
};