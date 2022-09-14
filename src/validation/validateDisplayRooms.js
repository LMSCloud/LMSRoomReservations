import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateDisplayRooms(e) {
  const rooms = document.getElementsByName('selected-displayed-room');
  let roomChecked = false;

  rooms.forEach((room) => {
    if (room.checked) { roomChecked = true; }
  });

  if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie mindestens einen Tag aus.' }); }

  return true;
}
