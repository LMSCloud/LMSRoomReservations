import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateManageBlackouts(e) {
  const actionChoice = document.forms.manageBlackoutsForm['manage-blackouts-action'].value;
  if (actionChoice === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

  return true;
}
