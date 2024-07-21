import * as THREE from 'three'
import { ApplyCollision, ApplyForce, Bezier, ColorOverLife, ConeEmitter, ConstantValue, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, RandomColorBetweenGradient, RenderMode, SizeOverLife } from 'three.quarks'

const texture = new THREE.TextureLoader().load("smoke2.png", texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const smokeMaterial = new THREE.MeshStandardMaterial({ map: texture, transparent: true, depthWrite: false });
const debrisMaterial = new THREE.MeshStandardMaterial({ transparent: true, alphaTest: 0.005, depthWrite: false });

const SMOKE_COLOR = 1;
const DEBRIS_COLOR = 0.7;

const DEFAULT_NORMAL = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

export const concreteHit = (position: THREE.Vector3, normal = DEFAULT_NORMAL, height: number) => {
  const debrisLife = height * 5;

  const smoke = new ParticleSystem({
    prewarm: true,
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0, arc: 6.283185307179586, thickness: 0, angle: 0.2 }),
    startLife: new IntervalValue(0.35, 0.75),
    startSpeed: new IntervalValue(0.3, 0.7),
    startRotation: new IntervalValue(0, 6),
    autoDestroy: true,
    emissionBursts: [{
        time: 0,
        count: new ConstantValue(4),
        cycle: 1,
        interval: 0.01,
        probability: 1,
    }],
    renderMode: RenderMode.Mesh,
    material: smokeMaterial,
  });

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.025, 0.05, 0.2, 0.4), 0]])));
  smoke.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new THREE.Vector3(SMOKE_COLOR, SMOKE_COLOR, SMOKE_COLOR), 0]], [[0.4, 0], [0.05, 0.7], [0, 1]]),
    new Gradient([[new THREE.Vector3(SMOKE_COLOR, SMOKE_COLOR, SMOKE_COLOR), 0]], [[0.15, 0], [0.05, 0.7], [0, 1]])
  )));

  const debris = new ParticleSystem({
    prewarm: true,
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0.025, arc: 6.283185307179586, thickness: 0, angle: 0.5 }),
    startLife: new IntervalValue(debrisLife - 0.2, debrisLife + 0.2),
    startSize: new IntervalValue(0.01, 0.03),
    startRotation: new IntervalValue(0, 6),
    startSpeed: new IntervalValue(0, 1.5),
    autoDestroy: true,
    emissionBursts: [{
      time: 0,
      count: new ConstantValue(3),
      cycle: 1,
      interval: 0.01,
      probability: 0.15,
    }],
    renderMode: RenderMode.Mesh,
    material: debrisMaterial
  });

  const moreDebris = new ParticleSystem({
    prewarm: true,
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0.025, arc: 6.283185307179586, thickness: 0, angle: 0.5 }),
    startLife: new IntervalValue(debrisLife - 0.2, debrisLife + 0.2),
    startSize: new IntervalValue(0, 0.01),
    startRotation: new IntervalValue(0, 6),
    startSpeed: new IntervalValue(1, 3),
    autoDestroy: true,
    emissionBursts: [{
      time: 0,
      count: new ConstantValue(5),
      cycle: 1,
      interval: 0.01,
      probability: 0.5,
    }],
    renderMode: RenderMode.Mesh,
    material: debrisMaterial,
  });

  smoke.emitter.name = 'smoke';
  debris.emitter.name = 'debris';
  moreDebris.emitter.name = 'moreDebris';

  const particles = [smoke, debris, moreDebris];

  // order: look at normal -> apply behaviors -> set positions

  particles.forEach(particle => {
    particle.emitter.lookAt(normal);
  });

  const debrisColor = new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new THREE.Vector3(DEBRIS_COLOR, DEBRIS_COLOR, DEBRIS_COLOR), 0]], [[1, 0], [1, 0.7], [0, 1]]),
    new Gradient([[new THREE.Vector3(DEBRIS_COLOR, DEBRIS_COLOR, DEBRIS_COLOR), 0]], [[0, 0], [0, 0.7], [0, 1]]),
  ));

  debris.addBehavior(debrisColor);
  moreDebris.addBehavior(debrisColor);

  const groundOffset = -0.01;
  const adjustedHeight = groundOffset + height ** 1.8;
  const collision = new ApplyCollision({
    resolve(pos, normal) {
      if (pos.y <= -(adjustedHeight)) {
        normal.set(0, 0.85, 0);
        return true;
      } else {
        return false;
      }
    },
  }, 0.9);

  debris.addBehavior(collision);
  moreDebris.addBehavior(collision);

  const force = new ApplyForce(debris.emitter.worldToLocal(DOWN.clone()), new ConstantValue(22));
  
  debris.addBehavior(force);
  moreDebris.addBehavior(force);
  
  particles.forEach(particle => {
    particle.emitter.position.add(position);
  });

  return particles;
}
