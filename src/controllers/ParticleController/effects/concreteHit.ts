import { MeshBasicMaterial, NearestFilter, TextureLoader, Vector3 } from 'three'
import { Bezier, ColorOverLife, ConeEmitter, ConstantValue, ForceOverLife, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, RandomColorBetweenGradient, RenderMode, SizeOverLife } from 'three.quarks'

const texture = new TextureLoader().load("smoke.png", texture => {
  texture.minFilter = texture.magFilter = NearestFilter;
});

const SMOKE_COLOR = 0.3;
const SMOKE_SHADOW = 0.1;

const DEBRIS_COLOR = 0.3;
const DEBRIS_COLOR2 = -0.03;

export const concreteHit = (position: Vector3, normal = new Vector3(0, 1, 0)) => {
  const smoke = new ParticleSystem({
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0, arc: 6.283185307179586, thickness: 0, angle: 0.2 }),
    startLife: new IntervalValue(0.5, 0.8),
    startSpeed: new IntervalValue(0.3, 1),
    startRotation: new IntervalValue(0, 6),
    autoDestroy: true,
    emissionBursts: [{
        time: 0,
        count: new ConstantValue(5),
        cycle: 1,
        interval: 0.01,
        probability: 1,
    }],
  
    material: new MeshBasicMaterial({ map: texture, transparent: true, alphaTest: 0, }),
  });

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.05, 0.1, 0.1, 0.5), 0]])));
  smoke.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new Vector3(SMOKE_COLOR, SMOKE_COLOR, SMOKE_COLOR), 0]], [[0.1, 0], [0.02, 0.7], [0, 1]]),
    new Gradient([[new Vector3(SMOKE_SHADOW, SMOKE_SHADOW, SMOKE_SHADOW), 0]], [[0.1, 0], [0.02, 0.7], [0, 1]])
  )));
  smoke.emitter.name = 'smoke';
  smoke.emitter.lookAt(normal);
  
  const debris = new ParticleSystem({
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0.025, arc: 6.283185307179586, thickness: 0 }),
    startLife: new IntervalValue(1, 3),
    startSize: new IntervalValue(0.01, 0.04),
    startSpeed: new IntervalValue(0, 0.5),
    autoDestroy: true,
    emissionBursts: [{
      time: 0,
      count: new ConstantValue(2),
      cycle: 1,
      interval: 0.01,
      probability: 1,
    }],
    
    material: new MeshBasicMaterial({ transparent: true, alphaTest: 0, }),
  });

  debris.addBehavior(new ForceOverLife(
    new ConstantValue(0), 
    new ConstantValue(-9.81),
    new ConstantValue(0) 
  ));

  const debrisColor = new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new Vector3(DEBRIS_COLOR, DEBRIS_COLOR, DEBRIS_COLOR), 0]], [[0.2, 0], [0, 1]]),
    new Gradient([[new Vector3(DEBRIS_COLOR2, DEBRIS_COLOR2, DEBRIS_COLOR2), 0]], [[0.2, 0], [0, 1]]),
  ))
  debris.addBehavior(debrisColor);
  
  debris.emitter.name = 'debris';
  debris.emitter.lookAt(normal);

  const moreDebris = new ParticleSystem({
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0.025, arc: 6.283185307179586, thickness: 0 }),
    startLife: new IntervalValue(1, 3),
    startSize: new IntervalValue(0.01, 0.04),
    startSpeed: new IntervalValue(1, 2),
    autoDestroy: true,
    emissionBursts: [{
      time: 0,
      count: new ConstantValue(2),
      cycle: 1,
      interval: 0.01,
      probability: 1,
    }],
    
    material: new MeshBasicMaterial({ transparent: true, blending: 1, alphaTest: 0, }),
  });

  moreDebris.addBehavior(debrisColor);
  moreDebris.addBehavior(new ForceOverLife(
    new ConstantValue(0), 
    new ConstantValue(-9.81),
    new ConstantValue(0) 
  ));
  
  moreDebris.emitter.name = 'moreDebris';
  moreDebris.emitter.lookAt(normal);

  const particles = []
  particles.push(smoke);
  particles.push(debris);
  particles.push(moreDebris);

  particles.forEach(particle => {
    particle.emitter.position.add(position);
  })

  return particles;
}
