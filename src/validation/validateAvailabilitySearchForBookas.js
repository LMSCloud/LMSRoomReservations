import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateAvailabilitySearchForBookas(e) {
  const startDate = document.forms.availabilitySearchForm['availability-search-start-date'].value;
  const startTime = document.forms.availabilitySearchForm['availability-search-start-time'].value;
  const endDate = document.forms.availabilitySearchForm['availability-search-end-date'].value;
  const endTime = document.forms.availabilitySearchForm['availability-search-end-time'].value;
  const maxCapacity = document.forms.availabilitySearchForm['availability-search-room-capacity'].value;

  if (startDate === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Startdatum an.' }); }
  if (startTime === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Startzeit an.' }); }
  if (endDate === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Enddatum an.' }); }
  if (endTime === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Endzeit an.' }); }
  if (maxCapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus.' }); }

  return true;
}
