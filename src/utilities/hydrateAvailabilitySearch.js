import getBlackoutsBySelectedRoom from './getBlackoutsBySelectedRoom';
import getEquipmentBySelectedRoom from './getEquipmentBySelectedRoom';
import getCheckedOptions from './getCheckedOptions';

export default function hydrateAvailabilitySearch({
  blackoutsArgs,
  equipmentArgs,
  checkedOptionsArgs,
}) {
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
