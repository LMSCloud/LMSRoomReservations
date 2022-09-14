import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function deleteRoomConfirmation(e) {
  const rooms = document.getElementsByName('delete-room-radio-button');
  let roomChecked = false;

  rooms.forEach((room) => {
    if (room.checked) {
      roomChecked = true;
    }
  });

  if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus, den Sie löschen möchten.' }); }
  const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie den ausgewählten Raum löschen möchten?');
  if (roomChecked && isConfirmedDelete) { return true; }

  e.preventDefault();
  return false;
}
