import validateDate from './validateDate';
import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateFullBlackout(e) {
  const startDate = document.forms.fullBlackoutForm['blackout-start-date'].value;
  const endDate = document.forms.fullBlackoutForm['blackout-end-date'].value;
  const rooms = document.getElementsByName('current-room-blackout');
  let roomChecked = false;

  if (!validateDate(startDate)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Startdatum an.' }); }
  if (!validateDate(endDate)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Enddatum an.' }); }

  rooms.forEach((room) => {
    if (room.checked) { roomChecked = true; }
  });

  if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum oder mehrere Räume aus.' }); }

  return true;
}
