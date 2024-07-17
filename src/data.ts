import { GunOptic } from './config/gunAttachments'

export type GunData = typeof WEAPONS_DATA.SMG;

export const WEAPONS_DATA = {
  'NONE': {
    equipTime: 0,
    unequipTime: 0
  },
  'SMG':  {
    damage: 10,
    rateOfFire: 95,
    magCapacity: 2500,
    weight: 1,

    equipTime: 500,
    unequipTime: 500,

    recoilXMin: -0.00055,
    recoilXMax: 0.0005,

    recoilYMin: 0.001,
    recoilYMax: 0.0015,

    kickXMin: 0.0015,
    kickXMax: 0.0025,

    kickYMin: 0.002,
    kickYMax: 0.004,

    knockbackMin: 0.02,
    knockbackMax: 0.03,
    spread: 0.05,

    
    renderParams: {
      body: 'guns/smg/body_stock.png',
      zoom: 3,
      
      ironsight: {
        stock: {
          texture: 'guns/smg/ironsight_stock.png',
          offsetY: -0.01
        },
        optic: {
          texture: 'guns/smg/ironsight_optic.png',
          offsetY: -0.04
        }
      },
      optics: {
        reflex: {
          body: 'guns/smg/body_reddot.png',
          glass: 'guns/smg/glass.png',
          zoom: 4,
          reticleScale: 0.06
        },
        acog: {
          body: 'guns/smg/body_acog.png',
          glass: 'guns/smg/glass_acog.png',
          zoom: 4,
          reticleScale: 0.0475
        }
      }
      
    },
  },
}

export const SMG_PARAMS = WEAPONS_DATA.SMG.renderParams;


type OpticParams = {
  body: string
  glass: string
  zoom: number
  reticleScale: number
};

export const SMG_OPTIC_PARAMS: { [key in GunOptic]: OpticParams } = {
  [GunOptic.REFLEX]: SMG_PARAMS.optics.reflex,
  [GunOptic.ACOG]: SMG_PARAMS.optics.acog
}
