import { Vector3Object } from '@react-three/rapier'
import * as THREE from 'three'
import { ApplyForce, BatchedRenderer, Bezier, ColorOverLife, ConeEmitter, ConstantValue, ForceOverLife, FrameOverLife, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, PointEmitter, RandomColorBetweenGradient, RenderMode, SizeOverLife } from 'three.quarks'
import { randomFloat } from '../../../helpers'

const SMOKE_COLOR = 1;
const VELOCITY_COMPENSATE = 35;
export const MAX_SMOKE_SYSTEMS = 6;

const smokeTexture = new THREE.TextureLoader().load("smoke2.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const muzzleTexture = new THREE.TextureLoader().load("muzzleflash.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const smokeMaterial = new THREE.MeshStandardMaterial({ 
  map: smokeTexture, 
  depthWrite: false,
  transparent: true,
  alphaTest: 0.001,
});
const muzzleMaterial = new THREE.MeshBasicMaterial({ 
  map: muzzleTexture, 
  alphaTest: 0.1 
});

const smokeColorVec = new THREE.Vector3(SMOKE_COLOR, SMOKE_COLOR, SMOKE_COLOR);
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
    system.addBehavior(new ApplyForce(new THREE.Vector3().set(randomFloat(-0.3, 0.3), randomFloat(-0.1, 0.15), randomFloat(0.1, 0.3)), new ConstantValue(12)));
    system.addBehavior(new ColorOverLife(new Gradient([[smokeColorVec, 0]], [[0.1, 0], [0, 1]]),))
  });
 
  const smoke = new ParticleSystem({
    duration: 1,
    looping: false,
    shape: new ConeEmitter({ radius: 0.0015, arc: 6.283185307179586, thickness: 0, angle: 0.1 }),
    startLife: new IntervalValue(0.5, 1.5),
    startSpeed: new IntervalValue(0, 1.5),
    startRotation: new IntervalValue(0, 6),
    emissionOverTime: new ConstantValue(0),
    worldSpace: false,
    autoDestroy: true,
    
    emissionBursts: [{
      time: 0,
      cycle: 1,
      interval: 0.01,
      count: new ConstantValue(4),
      probability: 1
    }],
   
    renderMode: RenderMode.Mesh,
    material: smokeMaterial,
  });

  const smokeColor = randomFloat(0.65, 1);
  smokeColorVec.set(smokeColor, smokeColor, smokeColor);

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.05, 0.1, 0.6, 1.5), 0]])));
  smoke.addBehavior(new ColorOverLife(
    new Gradient([[smokeColorVec, 0]], [[randomFloat(0.1, 0.15), 0], [0.1, 0.5], [0, 1]]),
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
