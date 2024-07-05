/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { useControls } from 'leva'
import { useEffect } from 'react'
import { useGunState } from '../../../state/gunState'

const STEP = 0.00001;
const PAD = 5;

export function GunParams() {
  const gun = useGunState();
  const params = useControls('Gun parameters', {
    recoilXMin: { value: gun.recoilXMin, step: STEP, pad: PAD },
    recoilXMax: { value: gun.recoilXMax, step: STEP, pad: PAD },
    recoilYMin: { value: gun.recoilYMin, step: STEP, pad: PAD },
    recoilYMax: { value: gun.recoilYMax, step: STEP, pad: PAD },
    kickXMin: { value: gun.kickXMin, step: STEP, pad: PAD },
    kickXMax: { value: gun.kickXMax, step: STEP, pad: PAD },
    kickYmin: { value: gun.kickYMin, step: STEP, pad: PAD },
    kickYMax: { value: gun.kickYMax, step: STEP, pad: PAD },
    spread: { value: gun.spread, step: STEP, pad: PAD },
    knockbackMin: { value: gun.knockbackMin, step: STEP, pad: PAD },
    knockbackMax: { value: gun.knockbackMax, step: STEP, pad: PAD },
  }, { collapsed: true });

  const reticle = useControls('Reticle', {
    reticle: { value: gun.reticle },
    reticleOpacity: { value: 1, min: 0, max: 1 },
    reticleShape: { value: gun.reticleShape, step: 1, min: 0, max: 31 },
    reticleColor: { value: gun.reticleColor },
    glassColor: { value: gun.glassColor }
  });

  useEffect(() => {
    window.addEventListener('wheel', (e: WheelEvent) => {
      if (e.deltaY < 0) {
        gun.setValue('reticleOpacity', (useGunState.getState().reticleOpacity + 0.25 > 1 ? 0.25 : useGunState.getState().reticleOpacity + 0.25));
      } else {
        gun.setValue('reticleShape', (gun.reticleShape++));
      }
    })
  }, []);

  useEffect(() => {
    Object.keys(params).forEach(param => {
      // @ts-expect-error testing only
      gun.setValue(param, params[param as keyof typeof params]);
    })
    
    Object.keys(reticle).forEach(param => {
      // @ts-expect-error testing only
      gun.setValue(param, reticle[param as keyof typeof reticle]);
    })
  }, [params, reticle])

  return null;
}