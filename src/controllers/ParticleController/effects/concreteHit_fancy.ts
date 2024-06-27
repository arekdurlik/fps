import { AdditiveBlending, MeshBasicMaterial, NearestFilter, Object3D, TextureLoader, Vector3 } from 'three'
import { Bezier, ColorOverLife, ConeEmitter, ConstantValue, ForceOverLife, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, RandomColorBetweenGradient, RenderMode, SizeOverLife } from 'three.quarks'

const texture = new TextureLoader().load("smoke.png", texture => {
  texture.minFilter = texture.magFilter = NearestFilter;
});

const SMOKE_COLOR = 0.2
const SMOKE_SHADOW = 0

export const concreteHit = (normal: Vector3) => {
  const smoke = new ParticleSystem({
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0, arc: 6.283185307179586, thickness: 0, angle: 0.2 }),
    startLife: new IntervalValue(0, 3),
    startSpeed: new IntervalValue(0.1, 0.7),
    autoDestroy: true,
    emissionBursts: [{
        time: 0,
        count: new ConstantValue(20),
        cycle: 1,
        interval: 0.01,
        probability: 1,
    }],
  
    material: new MeshBasicMaterial({ map: texture, transparent: true, blending: 1, alphaTest: 0, }),
  });

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0, 0.2, 0.2, 0.5), 0]])));
  smoke.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new Vector3(SMOKE_COLOR, SMOKE_COLOR, SMOKE_COLOR), 0], [new Vector3(SMOKE_COLOR, SMOKE_COLOR, SMOKE_COLOR), 0.5]], [[0.2, 0], [0, 1]]),
    new Gradient([[new Vector3(SMOKE_SHADOW, SMOKE_SHADOW, SMOKE_SHADOW), 0], [new Vector3(SMOKE_SHADOW, SMOKE_SHADOW ,SMOKE_SHADOW), 0.5]], [[1, 0], [0, 1]])
  )));
  smoke.emitter.name = 'smoke';
  smoke.emitter.lookAt(normal);
  
  const dust = new ParticleSystem({
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0.025, arc: 6.283185307179586, thickness: 0 }),
    startLife: new IntervalValue(1, 3),
    startSize: new IntervalValue(0.01, 0.04),
    startSpeed: new IntervalValue(0, 0.5),
    autoDestroy: true,
    emissionBursts: [{
      time: 0,
      count: new ConstantValue(30),
      cycle: 1,
      interval: 0.01,
      probability: 1,
    }],
    
    material: new MeshBasicMaterial({ map: texture, transparent: true, blending: 2, alphaTest: 0, }),
  });

  dust.addBehavior(new ForceOverLife(
    new ConstantValue(0), 
    new ConstantValue(-9.81),
    new ConstantValue(0) 
  ));

  dust.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new Vector3(0.2, 0.2, 0.2), 0], [new Vector3(0.2, 0.2, 0.2), 0.5]], [[0.2, 0], [0, 1]]),
    new Gradient([[new Vector3(-0.02, -0.02 ,-0.02), 0], [new Vector3(-0.02, -0.02 ,-0.02), 0.5]], [[1, 0], [0, 1]])
  )));
  
  dust.emitter.name = 'dust';
  dust.emitter.lookAt(normal);

  return [smoke, dust];
}
