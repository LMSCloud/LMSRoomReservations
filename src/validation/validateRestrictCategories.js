import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateRestrictCategories(e) {
  const numHours = document.getElementById('max-time-hours-field').value;
  if (numHours === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

  return true;
}
