import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateEditRooms(e) {
  const editChoice = document.forms.editRoomsForm['edit-rooms-choice'].value;
  if (editChoice === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

  return true;
}
