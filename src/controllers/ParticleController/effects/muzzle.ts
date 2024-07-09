import { Vector3Object } from '@react-three/rapier'
import * as THREE from 'three'
import { Bezier, ColorOverLife, ConeEmitter, ConstantValue, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, PointEmitter, RandomColorBetweenGradient, RenderMode, SizeOverLife } from 'three.quarks'

const smokeTexture = new THREE.TextureLoader().load("smoke.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const muzzleTexture = new THREE.TextureLoader().load("muzzleflash.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const SMOKE_COLOR = 1;
const VELOCITY_COMPENSATE = 35;

const velocityCompensate = new THREE.Vector3();

export const muzzle = (position: THREE.Vector3, direction: THREE.Vector3, velocity: Vector3Object, muzzleFlash: boolean) => {
  velocityCompensate.set(velocity!.x / VELOCITY_COMPENSATE, velocity!.y / VELOCITY_COMPENSATE, velocity!.z / VELOCITY_COMPENSATE);

  const smoke = new ParticleSystem({
    prewarm: true,
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0.025, arc: 6.283185307179586, thickness: 0, angle: 0.1 }),
    startLife: new IntervalValue(0.2, 2),
    startSpeed: new IntervalValue(0, 1.5),
    startRotation: new IntervalValue(0, 6),
    autoDestroy: true,
    emissionBursts: [{
      time: 0,
      count: new ConstantValue(5),
      cycle: 1,
      interval: 0.01,
      probability: 0.5,
    }],
    renderMode: RenderMode.Mesh,
    material: new THREE.MeshStandardMaterial({ map: smokeTexture, transparent: true, depthWrite: false }),
  });

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.1, 0.3, 0.7, 1), 0]])));
  smoke.addBehavior(new ColorOverLife(
    new Gradient([[new THREE.Vector3(SMOKE_COLOR, SMOKE_COLOR, SMOKE_COLOR), 0]], [[0.025, 0], [0.01, 0.5], [0, 1]]),
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
      startSize: new IntervalValue(0.2, 0.3),
      autoDestroy: true,

      emissionOverTime: new ConstantValue(1),
      
      material: new THREE.MeshBasicMaterial({ map: muzzleTexture, transparent: true, alphaTest: 0 }),
    });

    muzzle.emitter.name = 'muzzle';
    
    muzzle.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
      new Gradient([[new THREE.Vector3(1, 1, 0), 0]], [[1, 0], [0, 1]]),
      new Gradient([[new THREE.Vector3(1, 0, 0), 0]], [[0.1, 0], [0, 1]])
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
