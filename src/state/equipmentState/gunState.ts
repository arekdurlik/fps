import { EquipmentState,  useEquipmentState } from '.'
import { GunOpticObject } from '../../config/gunAttachments'
import { Gun } from '../../config/guns'
import { EquipmentType } from '../../constants'
import { playSound } from '../../utils'
import update from 'immutability-helper'
import { EquipmentStatePartial, EquipmentSubject, GunStateType } from './types'

const useGunState = {
  getState: () => useEquipmentState.getState() as GunStateType,
  setState: (partial: EquipmentStatePartial) => useEquipmentState.setState(partial)
};

export const GunState = {
  decreaseAmmoInMag: () => {
    const i = useEquipmentState.getState().equippedIndex;
    useGunState.setState(({ slots }) => ({ 
      slots: update(slots, { [i]: { roundsLeft: { $set: (slots[i] as Gun).roundsLeft - 1 }}})
    }));
  },

  reloadBegin() {
    const i = useEquipmentState.getState().equippedIndex;
    EquipmentState.notify(EquipmentSubject.RELOAD_BEGIN);

    playSound('reload', 0.5);
    useGunState.setState(({ slots }) => ({ 
      slots: update(slots, { [i]: { roundsLeft: { $set: (slots[i] as Gun).roundsPerMag }}}),
      reloading: true
    }));
  },

  reloadEnd() {
    EquipmentState.notify(EquipmentSubject.RELOAD_END);
    useGunState.setState(() => ({ 
      reloading: false
    }));
  },

  getActiveOpticParameters(): GunOpticObject | false {
    const equipped = useGunState.getState().computed.equipped;

    if (equipped.type !== EquipmentType.GUN || equipped.optic === null) return false;

    return equipped.attachments.optics[equipped.optic];
  },

  setActiveOpticParameters(data: Partial<GunOpticObject>) {
    useGunState.setState(({ computed: { equipped }, slots, equippedIndex }) => {
      // cancel if not a gun or no active optic
      if (equipped.type !== EquipmentType.GUN || equipped.optic === null) return {};

      const newEquipped = update(equipped, { attachments: { optics: { [equipped.optic!]: { $set: { ...equipped.attachments.optics[equipped.optic], ...data } }}}})
      const newSlots = update(slots, { [equippedIndex]: { $set: newEquipped }});

      return { slots: newSlots };
    });
  },

  get equipped() { return useGunState.getState().computed.equipped as Gun },
  get reloading() { return useGunState.getState().reloading },
}