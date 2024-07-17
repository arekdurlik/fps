export enum GunOptic {
  REFLEX = 'REFLEX',
  ACOG = 'ACOG'
}

export type GunOpticObject = {
  type: GunOptic,
  reticleOpacity: number
  reticleShape: number
  reticleColor: string
  glassColor: string
};


export type GunOptics = {
  [key in GunOptic]: GunOpticObject
};

export const defaultReflex: GunOpticObject = {
  type: GunOptic.REFLEX,
  reticleOpacity: 0.75,
  reticleShape: 0,
  reticleColor: '#ff0000',
  glassColor: '#aaffbb'
};

export const defaultAcog: GunOpticObject = {
  type: GunOptic.ACOG,
  reticleOpacity: 0.75,
  reticleShape: 0,
  reticleColor: '#00ff00',
  glassColor: '#aaffbb'
}