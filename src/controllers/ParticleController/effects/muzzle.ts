import { Vector3Object } from '@react-three/rapier'
import * as THREE from 'three'
import { ApplyForce, BatchedRenderer, Bezier, ColorOverLife, ConeEmitter, ConstantValue, ForceOverLife, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, PointEmitter, RandomColorBetweenGradient, RenderMode, SizeOverLife } from 'three.quarks'
import { randomDirection, randomFloat } from '../../../helpers'

const VELOCITY_COMPENSATE = 35;
export const MAX_SMOKE_SYSTEMS = 2;

const smokeTexture = new THREE.TextureLoader().load("smoke2.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const muzzleTexture = new THREE.TextureLoader().load("muzzleflash.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const smokeMaterial = new THREE.MeshStandardMaterial({ 
  map: smokeTexture, 
  depthWrite: false,
  depthTest: false,
  transparent: true,
  alphaTest: 0.01,
  blending: THREE.AdditiveBlending,
});
const muzzleMaterial = new THREE.MeshBasicMaterial({ 
  map: muzzleTexture, 
  alphaTest: 0.1, 
  transparent: true,
});

const smokeColorVec = new THREE.Vector3();
const muzzleColorMinVec = new THREE.Vector3(1, 1, 0);
const muzzleColorMaxVec = new THREE.Vector3(1, 0, 0);
const velocityCompensate = new THREE.Vector3();

const smokeSystems: ParticleSystem[] = [];

export const muzzle = (position: THREE.Vector3, direction: THREE.Vector3, velocity: Vector3Object, muzzleFlash: boolean, batchSystem: BatchedRenderer) => {
  velocityCompensate.set(velocity!.x / VELOCITY_COMPENSATE, velocity!.y / VELOCITY_COMPENSATE, velocity!.z / VELOCITY_COMPENSATE);

  if (smokeSystems.length > MAX_SMOKE_SYSTEMS) {
    batchSystem.deleteSystem(smokeSystems.shift()!);
  }

  // scatter alive smoke systems on each shot
  smokeSystems.forEach(system => {
    const x = randomFloat(0.05, 0.1) * randomDirection();
    system.addBehavior(new ApplyForce(new THREE.Vector3().set(x, randomFloat(-0.1, 0.1), randomFloat(0, 0.3)), new ConstantValue(15)));
    system.addBehavior(new ColorOverLife(new Gradient([[smokeColorVec, 0]], [[0.05, 0], [0, 1]]),))
    system.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.3, 0.4, 0.75, 1.25), 0]])))
  });
 
  const smoke = new ParticleSystem({
    duration: 1,
    looping: false,
    shape: new ConeEmitter({ radius: 0.0015, arc: 6.283185307179586, thickness: 0, angle: 0.1 }),
    startLife: new IntervalValue(0.7, 1),
    startSpeed: new IntervalValue(0.2, 1),
    startRotation: new IntervalValue(0, 6),
    startSize: new IntervalValue(0.7, 1),
    emissionOverTime: new ConstantValue(0),
    worldSpace: false,
    autoDestroy: true,
    
    emissionBursts: [{
      time: 0,
      cycle: 1,
      interval: 0.01,
      count: new ConstantValue(3),
      probability: 1
    }],
   
    renderMode: RenderMode.Mesh,
    material: smokeMaterial,
  });

  const smokeColor = randomFloat(0.9, 1);
  smokeColorVec.set(smokeColor, smokeColor - 0.25, smokeColor - 0.45);

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.1, 0.2, 0.3, 0.4), 0]])));
  smoke.addBehavior(new ColorOverLife(
    new Gradient([[smokeColorVec, 0]], [[randomFloat(0.1, 0.15), 0], [0.05, 0.5], [0, 1]]),
  ));
  smoke.addBehavior(new ForceOverLife(new ConstantValue(0), new ConstantValue(0.1), new ConstantValue(0)));

  const particles = [smoke];
  smokeSystems.push(smoke);

  if (muzzleFlash) {
    const muzzle = new ParticleSystem({
      prewarm: true,
      duration: 0,
      looping: false,
      shape: new PointEmitter(),
      startLife: new ConstantValue(0.02),
      startRotation: new IntervalValue(0, 6),
      startSize: new IntervalValue(0.15, 0.35),
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
  
  smoke.emitter.name = 'muzzleSmoke';
  smoke.emitter.lookAt(direction);

  particles.forEach(particle => {
    particle.emitter.position.add(position).add(velocityCompensate);
  });

  return particles;
}
