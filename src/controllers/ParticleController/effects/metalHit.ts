import * as THREE from 'three'
import { ApplyForce, Bezier, ColorOverLife, ColorRange, ConeEmitter, ConstantValue, Gradient, IntervalValue, ParticleSystem, PiecewiseBezier, PointEmitter, RandomColorBetweenGradient, RenderMode, SizeOverLife } from 'three.quarks'

const sparkTexture = new THREE.TextureLoader().load('spark.png', texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const smokeTexture = new THREE.TextureLoader().load('smoke.png', texture => {
  texture.minFilter = texture.magFilter = THREE.NearestFilter;
});

const smokeMaterial = new THREE.MeshStandardMaterial({ map: smokeTexture, transparent: true, depthWrite: false, blending: 1 });
const sparksMaterial = new THREE.MeshBasicMaterial({ blending: THREE.AdditiveBlending, transparent: true, side: THREE.DoubleSide, });
const up = new THREE.Vector3(0, 1, 0);
const down = new THREE.Vector3(0, -1, 0);

export const metalHit = (position: THREE.Vector3, direction: THREE.Vector3) => {

  const spark = new ParticleSystem({
    looping: false,
    duration: 0,
    startLife: new ConstantValue(0.05),
    startSpeed: new ConstantValue(0.1),
    startSize: new IntervalValue(0, 0.1),
    startRotation: new IntervalValue(0, 6),
    startColor: new ColorRange(new THREE.Vector4(1, 1, 1, 0.5), new THREE.Vector4(1, 0.5, 0, 0)),
    autoDestroy: true,
    
    emissionOverTime: new ConstantValue(1),

    renderMode: RenderMode.Mesh,
    shape: new ConeEmitter({ radius: 0, arc: 6.283185307179586, thickness: 0, angle: 0 }),
    material: new THREE.MeshBasicMaterial({
      map: sparkTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  });

  const spark2 = new ParticleSystem({
    looping: false,
    duration: 0,
    startLife: new ConstantValue(0.05),
    startSpeed: new ConstantValue(0.1),
    startSize: new IntervalValue(0, 0.25),
    startRotation: new IntervalValue(0, 6),
    startColor: new ColorRange(new THREE.Vector4(1, 1, 1, 0.05), new THREE.Vector4(1, 0.5, 0, 0)),
    autoDestroy: true,
    
    emissionOverTime: new ConstantValue(1),

    renderMode: RenderMode.Mesh,
    shape: new ConeEmitter({ radius: 0, arc: 6.283185307179586, thickness: 0, angle: 0 }),
    material: new THREE.MeshBasicMaterial({
      map: sparkTexture,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  });

  spark.emitter.translateOnAxis(direction, 0.015);
  spark2.emitter.translateOnAxis(direction, 0.015);

  const sparksTrail = new ParticleSystem({
    looping: false,
    startLife: new ConstantValue(0.1),
    startSpeed: new IntervalValue(2, 4),
    startSize: new IntervalValue(0.01, 0.02),
    worldSpace: true,
    autoDestroy: true,

    emissionOverTime: new ConstantValue(0),
    emissionBursts: [
      {
          time: 0,
          count: new ConstantValue(7),
          cycle: 1,
          interval: 0.01,
          probability: 1,
      },
    ],

    shape: new ConeEmitter({radius: 0, angle: 1}),
    material: sparksMaterial,
    renderMode: RenderMode.Trail,
    rendererEmitterSettings: {
        startLength: new IntervalValue(1.5, 2.5),
    },
  });
  sparksTrail.addBehavior(new ColorOverLife(new RandomColorBetweenGradient(
    new Gradient([[new THREE.Vector3(1, 1, 1), 0]], [[0.4, 0], [0, 1]]),
    new Gradient([[new THREE.Vector3(1, 0.5, 0), 0]], [[0, 0], [0, 1]]),
  )))
  sparksTrail.addBehavior(new ApplyForce(down, new ConstantValue(5)));

  const smoke = new ParticleSystem({
    prewarm: true,
    duration: 0,
    looping: false,
    shape: new ConeEmitter({ radius: 0, arc: 6.283185307179586, thickness: 0, angle: 1 }),
    startLife: new IntervalValue(0.3, 0.8),
    startSpeed: new IntervalValue(0, 0.3),
    startRotation: new IntervalValue(0, 6),
    autoDestroy: true,
    emissionBursts: [{
        time: 0,
        count: new ConstantValue(5),
        cycle: 1,
        interval: 0.01,
        probability: 1,
    }],
    renderMode: RenderMode.Mesh,
    material: smokeMaterial,
  });

  smoke.addBehavior(new SizeOverLife(new PiecewiseBezier([[new Bezier(0.05, 0.1, 0.1, 0.5), 0]])));
  smoke.addBehavior(new ColorOverLife(new Gradient([[new THREE.Vector3(1, 1, 1), 0]], [[0.1, 0], [0.05, 0.7], [0, 1]])));
  smoke.addBehavior(new ApplyForce(up, new ConstantValue(0.5)));

  spark.emitter.name = 'metalHit_spark';
  spark2.emitter.name = 'metalHit_spark2';
  sparksTrail.emitter.name = 'metalHit_sparksTrail';
  smoke.emitter.name = 'metalHit_smoke';

  const particles = [spark, spark2, sparksTrail, smoke];

  particles.forEach(particle => {
    particle.emitter.lookAt(direction);
  });


  particles.forEach(particle => {
    particle.emitter.position.add(position);
  });
  
  return particles;
}
