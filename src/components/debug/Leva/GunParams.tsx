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

  const opacityLevels = [0.333, 0.5, 0.75, 1];
  let opacityIndex = 0;

  useEffect(() => {
    window.addEventListener('wheel', (e: WheelEvent) => {
      const current = GunState.getActiveOpticParameters();

      if (!current) return;

      if (e.deltaY < 0) {
        opacityIndex = (opacityIndex + 1) % opacityLevels.length;
        GunState.setActiveOpticParameters({ ...current, reticleOpacity: opacityLevels[opacityIndex]});
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