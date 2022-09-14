import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateOpeningHours(e) {
  const start = document.forms.OpeningHoursForm['opening-from'].value;
  const end = document.forms.OpeningHoursForm['opening-to'].value;

  const weekdays = document.querySelectorAll('input[name="weekdays"]:checked');
  if (weekdays.length === 0) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie mindestens einen Wochentag aus.' }); }
  if (end <= start || start === 0 || end === 0) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine gültige Start- und Endzeit aus.' }); }

  return true;
}
