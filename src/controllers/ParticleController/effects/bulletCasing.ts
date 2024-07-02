import * as THREE from 'three'
import { Vector3Object } from '@react-three/rapier'
import { Bezier, ColorOverLife, ConeEmitter, ConstantValue, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, RandomColorBetweenGradient, RenderMode, SizeOverLife } from 'three.quarks'

const muzzleTexture = new THREE.TextureLoader().load("casing.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const FORWARD_OFFSET = -0.045;
const RIGHT_OFFSET = 0.0;
const DOWN_OFFSET = 0.0;
const VELOCITY_COMPENSATE = 32;

const velocityCompensate = new THREE.Vector3();
const cameraUp = new THREE.Vector3(0, 1, 0);
const DEFAULT_NORMAL = cameraUp;
const rightVector = new THREE.Vector3();
const initialPosition = new THREE.Vector3();


export const bulletCasing = (position: THREE.Vector3, normal = DEFAULT_NORMAL, velocity: Vector3Object) => {
  velocityCompensate.set(velocity!.x / VELOCITY_COMPENSATE, velocity!.y / VELOCITY_COMPENSATE, velocity!.z / VELOCITY_COMPENSATE);

  const casing = new ParticleSystem({
    prewarm: true,
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0, arc: 6.283185307179586, thickness: 0, angle: 0 }),
    startLife: new ConstantValue(0.1),
    startSpeed: new IntervalValue(2, 4),
    startRotation: new IntervalValue(0, 6),
    startSize: new ConstantValue(0.015),
    autoDestroy: true,
    renderMode: RenderMode.Mesh,
    material: new THREE.MeshStandardMaterial({ map: muzzleTexture, transparent: true, alphaTest: 0 }),
  });

  casing.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new THREE.Vector3(1, 1, 1), 0]], [[1, 0]]),
    new Gradient([[new THREE.Vector3(0.7, 0.7, 0.7), 0]], [[1, 0]])
  )));

  const size = Math.random() * 3
  casing.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, size, size, size), 0]])));

  casing.emitter.name = 'casing';

  // offset initial position from muzzle
  rightVector.crossVectors(normal, cameraUp).normalize();
  initialPosition
    .copy(position)
    .add(normal.clone().multiplyScalar(FORWARD_OFFSET))
    .add(rightVector.clone().multiplyScalar(RIGHT_OFFSET))
    .add(cameraUp.clone().negate().multiplyScalar(DOWN_OFFSET));

    casing.emitter.lookAt(rightVector);
    casing.emitter.position.add(initialPosition).add(velocityCompensate);
  return [casing];
}
