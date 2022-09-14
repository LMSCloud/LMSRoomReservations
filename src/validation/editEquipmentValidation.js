import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function editEquipmentValidation(e) {
  const equipment = document.getElementsByName('edit-equipment-radio-button');
  let equipmentChecked = false;

  equipment.forEach((item) => {
    if (item.checked) {
      equipmentChecked = true;
    }
  });

  if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Austattung aus, die Sie bearbeiten möchten.' }); }

  return true;
}
