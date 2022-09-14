import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateAvailabilitySearchResultsForBookas(e) {
  const rooms = document.getElementsByName('selected-room-id');

  let roomChecked = false;
  rooms.forEach((room) => {
    if (room.checked) {
      roomChecked = true;
    }
  });

  if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus um fortzufahren.' }); }

  return true;
}
