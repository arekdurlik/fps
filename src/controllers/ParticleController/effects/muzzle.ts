import { Vector3Object } from '@react-three/rapier'
import * as THREE from 'three'
import { Bezier, ColorOverLife, ConeEmitter, ConstantValue, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, PointEmitter, RandomColorBetweenGradient, RenderMode, RotationOverLife, SizeOverLife } from 'three.quarks'
import { RenderOrder } from '../../../constants'

const smokeTexture = new THREE.TextureLoader().load("smoke.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const muzzleTexture = new THREE.TextureLoader().load("muzzleflash.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const smokeMaterial = new THREE.MeshStandardMaterial({ 
  map: smokeTexture, 
  emissive: '#fff', 
  emissiveIntensity: 0.01, 
  transparent: true, 
  depthWrite: false, 
  depthTest: false 
});
const muzzleMaterial = new THREE.MeshBasicMaterial({ 
  map: muzzleTexture, 
  alphaTest: 0.1 
});

const SMOKE_COLOR = 1;
const VELOCITY_COMPENSATE = 35;

const smokeColorVec = new THREE.Vector3(SMOKE_COLOR, SMOKE_COLOR, SMOKE_COLOR);
const muzzleColorMinVec = new THREE.Vector3(1, 1, 0);
const muzzleColorMaxVec = new THREE.Vector3(1, 0, 0);
const velocityCompensate = new THREE.Vector3();

export const muzzle = (position: THREE.Vector3, direction: THREE.Vector3, velocity: Vector3Object, muzzleFlash: boolean) => {
  velocityCompensate.set(velocity!.x / VELOCITY_COMPENSATE, velocity!.y / VELOCITY_COMPENSATE, velocity!.z / VELOCITY_COMPENSATE);

  const smoke = new ParticleSystem({
    prewarm: true,
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0.025, arc: 6.283185307179586, thickness: 0, angle: 0.1 }),
    startLife: new IntervalValue(0.5, 2),
    startSpeed: new IntervalValue(0, 1.5),
    startRotation: new IntervalValue(0, 6),
    autoDestroy: true,
    emissionOverTime: new ConstantValue(1),
   
    renderMode: RenderMode.Mesh,
    material: smokeMaterial,
  });

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.05, 0.3, 0.7, 1), 0]])));
  smoke.addBehavior(new RotationOverLife(new IntervalValue(-2, 2)))
  smoke.addBehavior(new ColorOverLife(
    new Gradient([[smokeColorVec, 0]], [[0.03, 0], [0.01, 0.5], [0, 1]]),
  ));

  const particles = [smoke];

  if (muzzleFlash) {
    const muzzle = new ParticleSystem({
      prewarm: true,
      duration: 0,
      looping: false,
      shape: new PointEmitter(),
      startLife: new ConstantValue(0.02),
      startRotation: new IntervalValue(0, 6),
      startSize: new IntervalValue(0.2, 0.375),
      autoDestroy: true,

      emissionOverTime: new ConstantValue(1),
      
      material: muzzleMaterial,
    });

    muzzle.emitter.name = 'muzzle';
    muzzle.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
      new Gradient([[muzzleColorMinVec, 0]], [[1, 0], [0, 1]]),
      new Gradient([[muzzleColorMaxVec, 0]], [[0.1, 0], [0, 1]])
    )));

    particles.push(muzzle);
  }
  
  smoke.emitter.name = 'smoke';
  smoke.emitter.lookAt(direction);

  particles.forEach(particle => {
    particle.emitter.position.add(position).add(velocityCompensate);
  });

  return particles;
}
