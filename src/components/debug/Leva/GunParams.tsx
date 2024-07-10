/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck
import { useControls } from 'leva'
import { useEffect } from 'react'
import { useGunState } from '../../../state/gunState'

const STEP = 0.00001;
const PAD = 5;

export function GunParams() {
  /* const gun = useGunState();

  const reticle = useControls('Reticle', {
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
  }, [params, reticle]) */

  return null;
}