import * as THREE from 'three'
import { Vector3Object } from '@react-three/rapier'
import { Bezier, ColorOverLife, ConeEmitter, ConstantValue, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, RandomColorBetweenGradient, RenderMode, SizeOverLife } from 'three.quarks'

const muzzleTexture = new THREE.TextureLoader().load("casing.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const smokeTexture = new THREE.TextureLoader().load("smoke.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const RIGHT_OFFSET = 0.015;
const DOWN_OFFSET = 0.02;
const VELOCITY_COMPENSATE = 32;

const velocityCompensate = new THREE.Vector3();
const cameraUp = new THREE.Vector3(0, 1, 0);
const DEFAULT_NORMAL = cameraUp;
const rightVector = new THREE.Vector3();
const initialPosition = new THREE.Vector3();

export const bulletCasing = (position: THREE.Vector3, normal = DEFAULT_NORMAL, velocity: Vector3Object) => {
  velocityCompensate.set(velocity!.x / VELOCITY_COMPENSATE, velocity!.y / VELOCITY_COMPENSATE, velocity!.z / VELOCITY_COMPENSATE);
  const size = 0.2 + Math.random() * 2.5;

  const casing = new ParticleSystem({
    prewarm: true,
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0, arc: 6.283185307179586, thickness: 0, angle: 0 }),
    startLife: new ConstantValue(0.2),
    startSpeed: new IntervalValue(2, 4),
    startRotation: new IntervalValue(0, 6),
    startSize: new ConstantValue(0.0175),
    autoDestroy: true,
    renderMode: RenderMode.Mesh,
    material: new THREE.MeshStandardMaterial({ map: muzzleTexture, transparent: true, alphaTest: 0 }),
  });

  const smoke = new ParticleSystem({
    prewarm: true,
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0.005, arc: 6.283185307179586, thickness: 0, angle: 0.02 }),
    startLife: new IntervalValue(0.5, 0.9),
    startSpeed: new IntervalValue(0.2, 2),
    startRotation: new IntervalValue(0, 6),
    autoDestroy: true,
    emissionBursts: [{
      time: 0,
      count: new ConstantValue(25),
      cycle: 1,
      interval: 0.01,
      probability: 0.75,
    }],
    renderMode: RenderMode.Mesh,
    material: new THREE.MeshStandardMaterial({ map: smokeTexture, transparent: true, depthWrite: false }),
  });

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.005, 0.03, 0.1, 0.5), 0]])));
  smoke.addBehavior(new ColorOverLife(
    new Gradient([[new THREE.Vector3(1, 1, 1), 0]], [[0.05, 0], [0.01, 0.5], [0, 1]]),
  ));
  
  smoke.emitter.name = 'casingSmoke';
  casing.emitter.name = 'casing';

  const particles = [smoke, casing];

  casing.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new THREE.Vector3(1, 1, 1), 0]], [[1, 0]]),
    new Gradient([[new THREE.Vector3(0.7, 0.7, 0.7), 0]], [[1, 0]])
  )));

  casing.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, size, size, size), 0]])));

  // offset initial position from muzzle
  rightVector.crossVectors(normal, cameraUp).normalize();
  initialPosition
    .copy(position)
    .add(rightVector.clone().multiplyScalar(RIGHT_OFFSET))
    .add(cameraUp.clone().negate().multiplyScalar(DOWN_OFFSET));

  particles.forEach(particle => {
    particle.emitter.lookAt(rightVector);
    particle.emitter.position.add(initialPosition).add(velocityCompensate);
  });

  return particles;
}
