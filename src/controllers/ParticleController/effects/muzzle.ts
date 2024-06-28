import { MeshBasicMaterial, NearestFilter, TextureLoader, Vector3 } from 'three'
import { Bezier, ColorOverLife, ConeEmitter, ConstantValue, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, PointEmitter, RandomColorBetweenGradient, SizeOverLife } from 'three.quarks'

const smokeTexture = new TextureLoader().load("smoke.png", texture => {
  texture.minFilter = texture.magFilter = NearestFilter;
});

const muzzleTexture = new TextureLoader().load("muzzleflash.png", texture => {
  texture.minFilter = texture.magFilter = NearestFilter;
});

const SMOKE_COLOR = 0.2;
const SMOKE_SHADOW = 0;

export const muzzle = (position: Vector3, normal = new Vector3(0, 1, 0)) => {
  const smoke = new ParticleSystem({
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0.025, arc: 6.283185307179586, thickness: 0, angle: 0.1}),
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
  
    material: new MeshBasicMaterial({ map: smokeTexture, transparent: true, alphaTest: 0 }),
  });

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.1, 0.3, 0.7, 1), 0]])));
  smoke.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new Vector3(SMOKE_COLOR, SMOKE_COLOR, SMOKE_COLOR), 0]], [[0.05, 0], [0.015, 0.5], [0, 1]]),
    new Gradient([[new Vector3(SMOKE_SHADOW, SMOKE_SHADOW, SMOKE_SHADOW), 0]], [[0.025, 0], [0.015, 0.5], [0, 1]])
  )));
  smoke.emitter.name = 'smoke';
  smoke.emitter.lookAt(normal);
  smoke.emitter.position.add(position);

  const muzzle = new ParticleSystem({
    duration: 0,
    looping: false,
    shape: new PointEmitter(),
    startLife: new IntervalValue(0, 0.025),
    startRotation: new IntervalValue(0, 6),
    startSize: new IntervalValue(0.2, 0.4),
    autoDestroy: true,
  
    material: new MeshBasicMaterial({ map: muzzleTexture, transparent: true, alphaTest: 0 }),
  });

  muzzle.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new Vector3(1, 1, 1), 0]], [[0.3, 0], [0, 1]]),
    new Gradient([[new Vector3(1, 1, 0), 0]], [[0.05, 0], [0, 1]])
  )));
  
  muzzle.emitter.name = 'muzzle';
  muzzle.emitter.position.add(position);
  return [smoke, muzzle];
}
