import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateSavedRooms(e) {
  const savedRoomsAction = document.forms.saved_rooms.saved_rooms_action.value;
  if (savedRoomsAction === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }
  if (savedRoomsAction === 'delete') {
    const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie den ausgewählten Raum löschen möchten?');
    if (isConfirmedDelete) { return true; }

    e.preventDefault();
    return false;
  }

  const rooms = document.getElementsByName('selectedRoom');
  let roomValue = false;

  rooms.forEach((room) => {
    if (room.checked) { roomValue = true; }
  });

  if (!roomValue) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus.' }); }

  return true;
}
