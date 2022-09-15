import getBlackoutsBySelectedRoom from './getBlackoutsBySelectedRoom';
import getEquipmentBySelectedRoom from './getEquipmentBySelectedRoom';
import getCheckedOptions from './getCheckedOptions';

export default function hydrateAvailabilitySearch({
  roomSelectionRef,
  blackoutsArgs,
  equipmentArgs,
  checkedOptionsArgs,
}) {
  if (roomSelectionRef) {
    Array.from(roomSelectionRef.selectedOptions).forEach((selectedOption) => {
      const selectedOptionRef = selectedOption;
      selectedOptionRef.selected = false;
    });
  }
  getBlackoutsBySelectedRoom({
    entryPoint: blackoutsArgs.entryPoint,
    blackouts: blackoutsArgs.blackouts,
  });
  getEquipmentBySelectedRoom({
    entryPoint: equipmentArgs.entryPoint,
    rooms: equipmentArgs.rooms,
    equipment: equipmentArgs.equipment,
  });
  getCheckedOptions({
    elements: checkedOptionsArgs.elements,
    hiddenInputReference: checkedOptionsArgs.hiddenInputReference,
  });
}
