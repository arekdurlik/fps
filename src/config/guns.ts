import { EquipmentType } from '../constants'
import { defaultReflex, GunOptic, GunOptics } from './gunAttachments'

export enum GunType {
  NONE = 'NONE',
  SMG = 'SMG'
}

export type Gun = {
  item: GunType,
  type: EquipmentType.GUN,
  roundsLeft: number,
  roundsPerMag: number,
  ammo: number,
  ammoMax: number,
  
  optic: GunOptic | null
  attachments: {
    optics: GunOptics
  }
}

export type EquipmentItem = { type: EquipmentType.NONE, item: GunType.NONE } | Gun;

export const defaultSmg: Gun = {
  type: EquipmentType.GUN,
  item: GunType.SMG,
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