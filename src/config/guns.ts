import { EquipmentType } from '../constants'
import { defaultReflex, GunOptic, GunOptics } from './gunAttachments'

export enum GunName {
  NONE = 'NONE',
  SMG = 'SMG'
}

export type Gun = {
  type: EquipmentType.GUN,
  itemName: GunName,
  roundsLeft: number,
  roundsPerMag: number,
  ammo: number,
  ammoMax: number,
  
  optic: GunOptic | null
  attachments: {
    optics: GunOptics
  }
} 

export type None = { 
  type: EquipmentType.NONE,
  itemName: GunName.NONE 
};

export type EquipmentItem = None | Gun;

export const defaultSmg: Gun = {
  type: EquipmentType.GUN,
  itemName: GunName.SMG,
  
  roundsPerMag: 25,
  roundsLeft: 25,
  ammo: 25 * 4,
  ammoMax: 25 * 4,

  optic: null,
  attachments: {
    optics: {
      [GunOptic.REFLEX]: defaultReflex
    }
  }
}