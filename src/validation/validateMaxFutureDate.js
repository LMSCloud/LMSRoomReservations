import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateMaxFutureDate(e) {
  const num = document.getElementById('max-days-field').value;
  if (Number.isNaN(num)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }
  if (num === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

  return true;
}
