import { BulletHoleController } from './BulletHoleController'
import { BulletImpactController } from './BulletImpactController'
import { ParticleController } from './ParticleController'
import { PlayerController } from './PlayerController'
import { BulletCasingController } from './BulletCasingController'

export function Controllers() {
  return <>
    <BulletImpactController/>
    <BulletHoleController/>
    
    <ParticleController/>
    <PlayerController/>
    <BulletCasingController/>
  </>
}