import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateConfigActions(e) {
  const configAction = document.forms.config_actions.config_actions_selection.value;
  if (configAction === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

  return true;
}
