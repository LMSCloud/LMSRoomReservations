import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateAddEquipment(e) {
  const equipmentname = document.forms.addEquipment['add-equipment-text-field'].value;
  if (equipmentname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Austattungsbezeichnung darf nicht leer sein.' }); }

  return true;
}
