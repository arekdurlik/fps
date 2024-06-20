import * as THREE from "three"
import * as RAPIER from "@dimforge/rapier3d-compat"
import { MutableRefObject, useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { useRapier } from '@react-three/rapier'
import { useKeyboardInputRef } from '../inputs/useKeyboardInput'
import { lerp } from 'three/src/math/MathUtils.js'
import { usePlayerState } from '../../state/playerState'

const PLAYER_SPEED = 0.25;
const JUMP_VELOCITY = 4.5;
const JUMP_COOLDOWN = 200;

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const velocity = new THREE.Vector3();

let jumpStartTimestamp = 0;
let jumpEndTimestamp = 0;

export function usePlayerController(ref: MutableRefObject<RAPIER.RigidBody | null>) {
  const { camera } = useThree();
  const rapier = useRapier();
  const keyboard = useKeyboardInputRef(['w', 's', 'a', 'd', ' ', 'shift']);
  const player = ref.current;
  const playerStateRef = useRef(usePlayerState.getState());

  useEffect(() => {
    usePlayerState.subscribe(state => (playerStateRef.current = state));
  }, [])

  useFrame(() => {
    if (!player) return;

    const playerState = playerStateRef.current;

    // read keyboard inputs
    const { w, s, a, d, shift, space } = keyboard.current;

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

    // no moving in air
    if (!playerState.jumping) {

      // slow down velocity
      velocity.set(lerp(velocity.x, 0, 0.1), 0, lerp(velocity.z, 0, 0.1));
      
      if (w || a || s || d) {
        if (!shift) {
          if (!playerState.walking) {
            playerState.setWalking();
            playerState.notify('walkStart');
          }
        }
      } else {
        if (!playerState.idling) {
          playerState.setIdling();
          playerState.notify('idleStart');
        }
      }

      let speed = PLAYER_SPEED;
      
      // sprint
      if (w && shift) {
        speed *= 2;
  
        if (!playerState.running) {
          playerState.setRunning();
          playerState.notify('runStart');
        }
      }

      // stop sprinting
      if (playerState.running && !w) {
        playerState.setRunning(false);
        playerState.notify('runEnd');

        // switch to walking
        if (a || s || d) {
          playerState.setWalking();
          playerState.notify('walkStart');
        }
      }

      // strafe
      if (a) { 
        if (!playerState.strafingLeft && !d) {
          playerState.setStrafingLeft();
          playerState.notify('strafeLeftStart');
        }

      } else {
        if (playerState.strafingLeft) {
          playerState.setStrafingLeft(false);
          playerState.notify('strafeLeftEnd');
        }
      }
      
      if (d) { 
        if (!playerState.strafingRight && !a) {
          playerState.setStrafingRight();
          playerState.notify('strafeRightStart');
        }
      } else {
        if (playerState.strafingRight) {
          playerState.setStrafingRight(false);
          playerState.notify('strafeRightEnd');
        }
      }

      if (a && d) {
        if (playerState.strafingLeft) {
          playerState.setStrafingLeft(false);
          playerState.notify('strafeLeftEnd');
        } else if (playerState.strafingRight) {
          playerState.setStrafingRight(false);
          playerState.notify('strafeRightEnd');
        }
      }

      // calculate velocity
      if (w) { vertical += lerp(0, speed, 1); }
      if (s) { vertical -= lerp(0, speed, 1); }
      if (a) { horizontal -= lerp(0, playerState.running ? speed / 3 : speed, 1); }
      if (d) { horizontal += lerp(0, playerState.running ? speed / 3 : speed, 1); }

      if (horizontal !== 0) { velocity.add(right.multiplyScalar(horizontal)); }
      if (vertical !== 0) { velocity.add(forward.multiplyScalar(vertical)); }

      player.setLinvel({ x: velocity.x, y: player.linvel().y, z: velocity.z }, true);
    }
    
    // jump
    if (space && !playerState.jumping && grounded && (Date.now() - jumpEndTimestamp > JUMP_COOLDOWN )
    || (!playerState.jumping && !grounded)) { 
      playerState.setJumping(true);
  
      if (space) {
        playerState.notify('jumpStart');
        
        jumpStartTimestamp = Date.now();
        player.setLinvel({ x: player.linvel().x, y: JUMP_VELOCITY, z: player.linvel().z }, true);
      } else {
        playerState.notify('fallStart');
      }
    }
    
    // end jump
    if (grounded && playerState.jumping && (Date.now() - jumpStartTimestamp > 400)) {
      playerState.setJumping(false);
      playerState.notify('jumpEnd');

      jumpEndTimestamp = Date.now();
    }
  });
}