import { Vector3Object } from '@react-three/rapier'
import { MeshBasicMaterial, NearestFilter, TextureLoader, Vector3 } from 'three'
import { Bezier, ColorOverLife, ConeEmitter, ConstantValue, ForceOverLife, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, RandomColorBetweenGradient, SizeOverLife } from 'three.quarks'

const muzzleTexture = new TextureLoader().load("casing.png", texture => {
  texture.minFilter = texture.magFilter = NearestFilter;
});

const FORWARD_OFFSET = -0.045;
const RIGHT_OFFSET = 0.0;
const DOWN_OFFSET = 0.0;
const VELOCITY_COMPENSATE = 32;

const velocityCompensate = new Vector3();
const cameraUp = new Vector3(0, 1, 0);
const rightVector = new Vector3();
const initialPosition = new Vector3();

export const shellCasing = (position: Vector3, normal = new Vector3(0, 1, 0), velocity: Vector3Object) => {
  velocityCompensate.set(velocity!.x / VELOCITY_COMPENSATE, velocity!.y / VELOCITY_COMPENSATE, velocity!.z / VELOCITY_COMPENSATE);

  const muzzle = new ParticleSystem({
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0, arc: 6.283185307179586, thickness: 0, angle: 0 }),
    startLife: new ConstantValue(0.1),
    startSpeed: new IntervalValue(2, 4),
    startRotation: new IntervalValue(0, 6),
    startSize: new ConstantValue(0.015),
    autoDestroy: true,
  
    material: new MeshBasicMaterial({ map: muzzleTexture, transparent: true, alphaTest: 0 }),
  });

  muzzle.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new Vector3(0.3, 0.3, 0.2), 0]], [[1, 0], [1, 1]]),
    new Gradient([[new Vector3(0.05, 0.05, 0.05), 0]], [[1, 0], [1, 1]])
  )));

  const size = Math.random() * 3
  muzzle.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(1, size, size, size), 0]])));

  muzzle.addBehavior(new ForceOverLife(
    new ConstantValue(0), 
    new PiecewiseBezier([[new Bezier(-50 + Math.random() * 50, -9.81, -9.81, -9.81), 0]]),
    new ConstantValue(0) 
  ));
  
  muzzle.emitter.name = 'muzzle';

  // offset initial position from muzzle
  rightVector.crossVectors(normal, cameraUp).normalize();
  initialPosition
    .copy(position)
    .add(normal.clone().multiplyScalar(FORWARD_OFFSET))
    .add(rightVector.clone().multiplyScalar(RIGHT_OFFSET))
    .add(cameraUp.clone().negate().multiplyScalar(DOWN_OFFSET));

  muzzle.emitter.lookAt(rightVector);
  muzzle.emitter.position.add(initialPosition).add(velocityCompensate);
  return [muzzle];
}
