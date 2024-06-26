import * as THREE from "three"
import * as RAPIER from "@dimforge/rapier3d-compat"
import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { lerp } from 'three/src/math/MathUtils.js'
import { PlayerState, PlayerSubjects, usePlayerState } from '../state/playerState'
import { GunState } from '../state/gunState'
import { useMouseInputRef } from '../hooks/useMouseInput'
import { useKeyboardInputRef } from '../hooks/useKeyboardInput'

const PLAYER_SPEED = 0.2;
const JUMP_VELOCITY = 4.5;
const JUMP_COOLDOWN = 200;

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const velocity = new THREE.Vector3();

let jumpStartTimestamp = 0;
let jumpEndTimestamp = 0;

export function PlayerController() {
  const { camera } = useThree();
  const rapier = useRapier();
  const keyboard = useKeyboardInputRef(['w', 's', 'a', 'd', 'r', ' ', 'shift']);
  const mouse = useMouseInputRef();
  const playerRef = usePlayerState(state => state.player);
  const alreadyTriedToFire = useRef(false);

  useFrame(() => {
    const player = playerRef?.current;
    if (!player) return;

    // read inputs
    const { w, s, a, d, r, shift, space } = keyboard.current;
    const { lmb, rmb } = mouse.current;

    // make camera follow the player
    camera.position.set(
      player.translation().x, 
      player.translation().y + 0.5, 
      player.translation().z
    );

    // get camera's forward and right direction
    forward.setFromMatrixColumn(camera.matrix, 0);
    forward.crossVectors(camera.up, forward);
    right.setFromMatrixColumn(camera.matrix, 0);
    
    let [horizontal, vertical] = [0, 0];
    
    // ground raycast
    const rayDirection = { x: 0, y: -1, z: 0 };

    const rayOrigin1 = { x: player.translation().x + 0.125, y: player.translation().y - 0.705, z: player.translation().z + 0.125 };
    const rayOrigin2 = { x: player.translation().x - 0.125, y: player.translation().y - 0.705, z: player.translation().z - 0.125 };
    const rayOrigin3 = { x: player.translation().x + 0.125, y: player.translation().y - 0.705, z: player.translation().z - 0.125 };
    const rayOrigin4 = { x: player.translation().x - 0.125, y: player.translation().y - 0.705, z: player.translation().z + 0.125 };
    
    const grounded1 = rapier.world.castRay(new RAPIER.Ray(rayOrigin1, rayDirection), 0, false);
    const grounded2 = rapier.world.castRay(new RAPIER.Ray(rayOrigin2, rayDirection), 0, false);
    const grounded3 = rapier.world.castRay(new RAPIER.Ray(rayOrigin3, rayDirection), 0, false);
    const grounded4 = rapier.world.castRay(new RAPIER.Ray(rayOrigin4, rayDirection), 0, false);
    
    const grounded = grounded1 || grounded2 || grounded3 || grounded4;

    if (!GunState.reloading) {
      // fire gun or empty click
      if (!PlayerState.running && lmb) {
        if (GunState.ammoInMag === 0) {
          if (!alreadyTriedToFire.current) {
            alreadyTriedToFire.current = true;
            PlayerState.notify(PlayerSubjects.SHOT_FIRED);
          }
        } else {
          PlayerState.notify(PlayerSubjects.SHOT_FIRED);
        }
      }

      if (r && !shift && !lmb && !rmb) {
        GunState.reloadStart();
      }

      // reset single click on empty mag
      if (!lmb && alreadyTriedToFire.current) {
        alreadyTriedToFire.current = false;
      }
    
      // aim
      if (!PlayerState.running && !PlayerState.aiming && rmb) {
        PlayerState.setAiming();
      }
      
      // stop aiming
      if (PlayerState.aiming && !rmb) {
        PlayerState.setAiming(false);
      }
    }

    // no moving in air
    if (!PlayerState.jumping) {

      // slow down velocity
      velocity.set(lerp(velocity.x, 0, 0.1), 0, lerp(velocity.z, 0, 0.1));

      
      
      if (w || a || s || d) {
        if (!shift) {
          if (!PlayerState.walking) {
            PlayerState.setWalking();
          }
        }
      } else {
        if (!PlayerState.idling) {
          PlayerState.setIdling();
        }
      }

      let speed = PLAYER_SPEED;
      
      if (!GunState.reloading) {
        // sprint
        if (!PlayerState.aiming && w && shift) {
          speed *= 2;
    
          if (!PlayerState.running) {
            PlayerState.setRunning();
          }
        }

        // stop sprinting
        if (PlayerState.running && !w) {
          PlayerState.setRunning(false);

          // switch to walking
          if (a || s || d) {
            PlayerState.setWalking();
          }
        }
      }

      // strafe
      if (a) { 
        if (!PlayerState.strafingLeft && !d) {
          PlayerState.setStrafingLeft();
        }

      } else {
        if (PlayerState.strafingLeft) {
          PlayerState.setStrafingLeft(false);
        }
      }
      
      if (d) { 
        if (!PlayerState.strafingRight && !a) {
          PlayerState.setStrafingRight();
        }
      } else {
        if (PlayerState.strafingRight) {
          PlayerState.setStrafingRight(false);
        }
      }

      if (a && d) {
        if (PlayerState.strafingLeft) {
          PlayerState.setStrafingLeft(false);
        } else if (PlayerState.strafingRight) {
          PlayerState.setStrafingRight(false);
        }
      }

      // calculate velocity
      if (w) { vertical += lerp(0, speed, 1); }
      if (s) { vertical -= lerp(0, speed, 1); }
      if (a) { horizontal -= lerp(0, PlayerState.running ? speed / 3 : speed, 1); }
      if (d) { horizontal += lerp(0, PlayerState.running ? speed / 3 : speed, 1); }

      if (horizontal !== 0) { velocity.add(right.multiplyScalar(horizontal)); }
      if (vertical !== 0) { velocity.add(forward.multiplyScalar(vertical)); }

      player.setLinvel({ x: velocity.x, y: player.linvel().y, z: velocity.z }, true);
    }
  
    // jump
    if (space && !PlayerState.jumping && grounded && (Date.now() - jumpEndTimestamp > JUMP_COOLDOWN )
      || (!PlayerState.jumping && !grounded)) { 
    
      if (space) {
        if (!GunState.reloading) {
          PlayerState.setJumping(true);
          
          jumpStartTimestamp = Date.now();
          player.setLinvel({ x: player.linvel().x, y: JUMP_VELOCITY, z: player.linvel().z }, true);
        }
      } else {
        PlayerState.setJumping(true, { fall: true });
      }
    }
    // end jump
    if (grounded && PlayerState.jumping && (Date.now() - jumpStartTimestamp > 400)) {
      PlayerState.setJumping(false);
      PlayerState.notify(PlayerSubjects.JUMP_END);

      jumpEndTimestamp = Date.now();
    }
  });

  return null;
}