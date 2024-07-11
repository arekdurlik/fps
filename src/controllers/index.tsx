import { BulletHoleController } from './BulletHoleController'
import { BulletImpactController } from './BulletImpactController'
import { ParticleController } from './ParticleController'
import { PlayerController } from './PlayerController'
import { BulletCasingController } from './BulletCasingController'
import { AudioController } from './AudioController'

export function Controllers() {
  return <>
    <BulletImpactController/>
    <BulletHoleController/>
    <BulletCasingController/>
    <ParticleController/>
    <PlayerController/>
    <AudioController/>
  </>
}