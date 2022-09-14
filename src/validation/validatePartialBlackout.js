import validateDate from './validateDate';
import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validatePartialBlackout(e) {
  const blackoutStartTime = document.forms.partialBlackoutForm['blackout-start-time'].value;
  const blackoutEndTime = document.forms.partialBlackoutForm['blackout-end-time'].value;
  const rooms = document.getElementsByName('current-room-blackout');
  let blackoutDate = document.forms.partialBlackoutForm['blackout-date'].value;
  let roomChecked = false;

  if (!validateDate(blackoutDate)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Datum an.' }); }

  // convert date format from mm/dd/yyyy to yyyy-mm-dd
  blackoutDate = blackoutDate.replace(/(\d\d)\/(\d\d)\/(\d{4})/, '$3-$1-$2');

  // timestamp of MySQL type DATETIME
  const startTimestamp = `${blackoutDate}  ${blackoutStartTime}`;
  const endTimestamp = `${blackoutDate} ${blackoutEndTime}`;

  // determines if invalid start/end values were entered
  if (startTimestamp >= endTimestamp) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Start- und Endzeit an.' }); }

  rooms.forEach((room) => {
    if (room.checked) { roomChecked = true; }
  });

  if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum oder mehrere Räume aus.' }); }

  return true;
}
