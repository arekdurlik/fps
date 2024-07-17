import { useControls } from 'leva'
import { GunState } from '../../../state/equipmentState/gunState'
import { useEffect } from 'react'

export function GunParams() {
  const reticle = useControls('Reticle', {
    reticleOpacity: { value: 1, min: 0, max: 1 },
    reticleShape: { value: 0, step: 1, min: 0, max: 31 },
    reticleColor: { value: '#ff0000' },
    glassColor: { value: '#aaffbb' }
  });


  useEffect(() => {
    window.addEventListener('wheel', (e: WheelEvent) => {
      const current = GunState.getActiveOpticParameters();

      if (!current) return;

      if (e.deltaY < 0) {
        GunState.setActiveOpticParameters({ ...current, reticleOpacity: current.reticleOpacity + 0.333 > 1 ? 0.333 : current.reticleOpacity + 0.333 });
      } else {
        GunState.setActiveOpticParameters({ ...current, reticleShape: current.reticleShape + 1 });
      }
    })
  }, []);

  useEffect(() => {
    GunState.setActiveOpticParameters(reticle);
  }, [reticle])

  return null;
}