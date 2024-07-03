import { useControls } from 'leva'
import { useEffect } from 'react'
import { useGunState } from '../../../state/gunState'

const STEP = 0.00001;
const PAD = 5;
export function GunParams() {
  const gun = useGunState();
  const values = useControls('Gun parameters', {
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

  useEffect(() => {
    Object.keys(values).forEach(param => {
      // @ts-expect-error testing only
      gun.setValue(param, values[param as keyof typeof values]);
    })
  }, [values])

  return null;
}