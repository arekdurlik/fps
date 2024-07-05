export const WEAPONS_DATA = {
  'smg':  {
    damage: 10,
    rateOfFire: 90,
    magCapacity: 25,
    weight: 1,

    recoilXMin: -0.00075,
    recoilXMax: 0.0015,
    recoilYMin: 0.001,
    recoilYMax: 0.0015,
    kickXMin: -0.005,
    kickXMax: 0.005,
    kickYMin: -0.005,
    kickYMax: 0.01,
    knockbackMin: 0.02,
    knockbackMax: 0.05,
    spread: 0.015,

    renderParams: {
      stock: {
        body: 'guns/smg/body_stock.png',
        ironsight: 'guns/smg/ironsight_stock.png',
        ironSightY: -0.01
      },
      reddot: {
        body: 'guns/smg/body_reddot.png',
        ironsight: 'guns/smg/ironsight_reddot.png',
        glass: 'guns/smg/glass.png',
        ironSightY: -0.04
      }
    },
  },
}

export const SMG_PARAMS = WEAPONS_DATA.smg.renderParams;

export const SMG_BODY_STOCK = WEAPONS_DATA.smg.renderParams.stock.body;
export const SMG_BODY_SIGHT = WEAPONS_DATA.smg.renderParams.reddot.body;

export const SMG_IRONSIGHT_STOCK = WEAPONS_DATA.smg.renderParams.stock.ironsight;
export const SMG_IRONSIGHT_REDDOT = WEAPONS_DATA.smg.renderParams.reddot.ironsight;

export const SMG_GLASS_REDDOT = WEAPONS_DATA.smg.renderParams.reddot.glass;

