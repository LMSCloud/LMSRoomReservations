import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateEditRoomsEquipment(e) {
  const equipment = document.getElementsByName('edit-rooms-current-equipment');
  let equipmentChecked = false;

  equipment.forEach((item) => {
    if (item.checked) {
      equipmentChecked = true;
    }
  });

  if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Raumaustattung darf nicht leer sein. Sollte der Raum über keine Austattung verfügen, geben Sie \'nichts\' an.' }); }

  return true;
}
