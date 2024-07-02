import { BulletHoleController } from './BulletHoleController'
import { BulletImpactController } from './BulletImpactController'
import { ParticleController } from './ParticleController'
import { PlayerController } from './PlayerController'
import { ShellCasingController } from './ShellCasingController'

export function Controllers() {
  return <>
    <BulletImpactController/>
    <BulletHoleController/>
    
    <ParticleController/>
    <PlayerController/>
    {/* <ShellCasingController/> */}
  </>
}