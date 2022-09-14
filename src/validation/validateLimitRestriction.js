import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateLimitRestriction(e) {
  const limitCount = document.getElementById('reservations-limit-field').value;
  if (limitCount === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Wert aus.' }); }

  return true;
}
