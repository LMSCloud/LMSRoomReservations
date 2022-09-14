import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateConfirmation(e) {
  const resLimit = document.getElementById('count-limit').value;
  const userLimit = document.getElementById('user-daily-limit').value;

  if (userLimit === resLimit && userLimit > 0 && e.submitter.name === 'confirmationSubmit') {
    return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Sie haben die maximale Anzahl an Reservierungen für Ihr Konto für diesen Tag erreicht.' });
  }

  return true;
}
