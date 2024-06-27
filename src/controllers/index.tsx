import { BulletHoleController } from './BulletHoleController'
import { BulletImpactController } from './BulletImpactController'
import { ParticleController } from './ParticleController'
import { PlayerController } from './PlayerController'

export function Controllers() {
  return <>
    <BulletImpactController/>
    <BulletHoleController/>
    
    <ParticleController/>
    <PlayerController/>
  </>
}