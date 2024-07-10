export const WEAPONS_DATA = {
  'NONE': {
    equipTime: 200,
    unequipTime: 200
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
    kickXMin: -0.005,
    kickXMax: 0.005,
    kickYMin: -0.005,
    kickYMax: 0.01,
    knockbackMin: 0.02,
    knockbackMax: 0.05,
    spread: 0.05,

    renderParams: {
      stock: {
        body: 'guns/smg/body_stock.png',
        ironsight: 'guns/smg/ironsight_stock.png',
        ironSightY: -0.01,
        zoom: 3
      },
      reddot: {
        body: 'guns/smg/body_reddot.png',
        ironsight: 'guns/smg/ironsight_reddot.png',
        glass: 'guns/smg/glass.png',
        ironSightY: -0.04,
        zoom: 6
      }
    },
  },
}

export const SMG_PARAMS = WEAPONS_DATA.SMG.renderParams;

export const SMG_BODY_STOCK = SMG_PARAMS.stock.body;
export const SMG_BODY_SIGHT = SMG_PARAMS.reddot.body;

export const SMG_IRONSIGHT_STOCK = SMG_PARAMS.stock.ironsight;
export const SMG_IRONSIGHT_REDDOT = SMG_PARAMS.reddot.ironsight;

export const SMG_GLASS_REDDOT = SMG_PARAMS.reddot.glass;

export const SMG_IRONSIGHT_ZOOM = SMG_PARAMS.stock.zoom;
export const SMG_REDDOT_ZOOM = SMG_PARAMS.reddot.zoom;

