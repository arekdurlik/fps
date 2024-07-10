import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { EquipmentState, EquipmentSubject, useEquipmentState } from '../../../state/equipmentState'
import { Gun } from '../Gun'
import { useFrame } from '@react-three/fiber'
import { WEAPONS_DATA } from '../../../data'
import { useEquipmentAnimations } from './animations'
import { EquipmentType,} from '../../../constants'
import { PlayerState } from '../../../state/playerState'

export function Equipment() {
  const swapping = useRef(false);
  const { equippedIndex, slots, computed } = useEquipmentState();
  const itemToEquip = useRef(-1);
  const ref = useRef<THREE.Group>(null!);
  const animations = useEquipmentAnimations();
  const equippedIndexRef = useRef(useEquipmentState.getState().equippedIndex);

  useEffect(() => {
    const indexUnsubscribe = useEquipmentState.subscribe(
      state => equippedIndexRef.current = state.equippedIndex
    );

    const eqUnsubscribe = EquipmentState.subscribeMany([
      [EquipmentSubject.ITEM_SWAP, () => EquipmentState.setEquipped(itemToEquip.current)],
      [EquipmentSubject.EQUIP_END, () => swapping.current = false],
    ]);
    
    document.addEventListener('keydown', handleKey);
    
    return () => {
      indexUnsubscribe();
      eqUnsubscribe();
    }
  }, []);
  
  function handleKey(e: KeyboardEvent) {
    if (!PlayerState.canShoot) return;
    
    const key = Number(e.key);
    itemToEquip.current = key - 1;
    
    if (itemToEquip.current !== equippedIndexRef.current && key > 0 && key <= slots.length) {

      const unequipTime =  WEAPONS_DATA[slots[equippedIndex].item].unequipTime;
      const equipTime = WEAPONS_DATA[slots[itemToEquip.current].item].equipTime;

      swapping.current = true;
      animations.swap(equipTime, unequipTime);
      EquipmentState.notify(EquipmentSubject.EQUIP_BEGIN);
    }
  }

  useFrame(() => {
    if (!swapping.current) return;

    ref.current.position.x = animations.posX;
    ref.current.position.y = animations.posY;
    ref.current.rotation.z = animations.rot;
  });

  function getItem() {
    switch(computed.equipped?.type) {
      case EquipmentType.GUN: return <Gun {...computed.equipped}/>
      default: return <></>;
    }
  }
  
  return <group ref={ref}>
    {getItem()}
  </group>
}