import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function deleteEquipmentConfirmation(e) {
  const equipment = document.getElementsByName('delete-equipment-radio-button');
  let equipmentChecked = false;

  equipment.forEach((item) => {
    if (item.checked) {
      equipmentChecked = true;
    }
  });

  if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Austattung aus, die Sie löschen möchten.' }); }

  const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie die ausgewählte Raumaustattung löschen möchten?');
  if (isConfirmedDelete) { return true; }

  e.preventDefault();
  return false;
}
