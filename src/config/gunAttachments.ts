export enum GunOptic {
  REFLEX = 'REFLEX'
}

export type GunOpticObject = {
  reticleOpacity: number
  reticleShape: number
  reticleColor: string
  glassColor: string
};

export type GunOptics = {
  [key in GunOptic]: GunOpticObject
};

export const defaultReflex: GunOpticObject = {
  reticleOpacity: 0.75,
  reticleShape: 0,
  reticleColor: '#ff0000',
  glassColor: '#779955'
};