/* eslint-disable max-classes-per-file */
/* eslint-disable no-unused-vars */
export function loadSelectedAction() { document.getElementById('actionSelectedBtn').click(); }

const customElementsRegistry = window.customElements;
customElementsRegistry.define(
  'lmsr-toast',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('lmsr-toast-template').content;
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.cloneNode(true));
    }
  },
);
customElementsRegistry.define(
  'lmsr-equipment-selection',
  class extends HTMLElement {
    constructor() {
      super();
      const template = document.getElementById('lmsr-equipment-selection-template').content;
      const shadowRoot = this.attachShadow({ mode: 'open' });
      shadowRoot.appendChild(template.cloneNode(true));
    }
  },
);

const prohibitFormSubmitWithMessage = ({ e, type, message }) => {
  e.preventDefault();
  const lmsrNotifications = document.getElementById('lmsr-notifications');
  lmsrNotifications.innerHTML = '';
  const lmsrToast = document.createElement('lmsr-toast', { is: 'lmsr-toast' });
  lmsrToast.innerHTML = `
    <strong slot="title">${type}</strong>
    <p slot="message">${message}</p>
  `;
  lmsrNotifications.appendChild(lmsrToast);

  return false;
};

export function closeToast() {
  const lmsrToast = document.querySelector('lmsr-toast');
  const lmsrToastRoot = document.querySelector('lmsr-toast').shadowRoot;
  const lmsrToastButtonClose = lmsrToastRoot.querySelector('.lmsr-toast-button-close');
  lmsrToastButtonClose.addEventListener('click', () => { lmsrToast.remove(); });
  lmsrToastButtonClose.disabled = false;
  window.setTimeout(() => { lmsrToast.remove(); }, 3000);
}

export function getEquipmentBySelectedRoom({ rooms, lmsrEquipmentSelectionEntryPoint }) {
  const lmsrEquipmentSelection = document.getElementById('lmsr-equipment-selection');
  lmsrEquipmentSelection.innerHTML = '';
  const [selectedRoom] = document.getElementById('availability-search-room').selectedOptions;
  const roomData = rooms.find((room) => room.roomnumber === selectedRoom.text.replace(/\(.*\)/, '').trim());
  roomData?.equipment.forEach((item) => {
    const lmsrEquipmentSelectionCheckForm = document.createElement('lmsr-equipment-selection', { is: 'lmsr-equipment-selection' });
    const itemMachineReadable = item.equipmentname.replace(' ', '_');
    lmsrEquipmentSelectionCheckForm.innerHTML = `
      <input slot="lmsr-check-input" type="checkbox" value="" id="${itemMachineReadable}">
      <label slot="lmsr-check-label" for="${itemMachineReadable}">${item.equipmentname}</label>
    `;
    lmsrEquipmentSelectionEntryPoint.appendChild(lmsrEquipmentSelectionCheckForm);
  });
}

export function validateOpeningHours(e) {
  const start = document.forms.OpeningHoursForm['opening-from'].value;
  const end = document.forms.OpeningHoursForm['opening-to'].value;

  const weekdays = document.querySelectorAll('input[name="weekdays"]:checked');
  if (weekdays.length === 0) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie mindestens einen Wochentag aus.' }); }
  if (end <= start || start === 0 || end === 0) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine gültige Start- und Endzeit aus.' }); }

  return true;
}
export function validateBookingAction(e) {
  const action = document.forms.manageBookingsForm['manage-bookings-action'].value;
  const ids = document.getElementsByName('manage-bookings-id');

  let checked = 0;
  ids.forEach((id) => {
    if (id.checked) { checked += 1; }
  });

  if (checked !== 1) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }
  if (action === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

  return true;
}

export function validateManageBlackouts(e) {
  const actionChoice = document.forms.manageBlackoutsForm['manage-blackouts-action'].value;
  if (actionChoice === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

  return true;
}

export function validateDate(dateStr) { return true; }
// const regExp = /^(\d{4})-(\d\d?)-(\d\d?)$/;
// const matches = dateStr.match(regExp);
// console.log(matches);
// let isValid = matches;
// const maxDate = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

// if (matches) {
//   const year = parseInt(matches[1], 10);
//   const month = parseInt(matches[2], 10);
//   const date = parseInt(matches[3], 10);

//   isValid = month <= 12 && month > 0;
//   isValid &= date <= maxDate[month] && date > 0;

//   const leapYear = (year % 400 === 0) || (year % 4 === 0 && year % 100 !== 0);
//   isValid &= month != 2 || leapYear || date <= 28;
// }

// return isValid;

export function validateFullBlackout(e) {
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

export function validatePartialBlackout(e) {
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

export function setBlackoutValueOnChange(e) { e.target.value = e.target.value; }

export function validateAvailabilitySearchForBookas(e) {
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

export function validateAvailabilitySearchResultsForBookas(e) {
  const rooms = document.getElementsByName('selected-room-id');

  let roomChecked = false;
  rooms.forEach((room) => {
    if (room.checked) {
      roomChecked = true;
    }
  });

  if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus um fortzufahren.' }); }

  return true;
}

export function validateSavedRooms(e) {
  const savedRoomsAction = document.forms.saved_rooms.saved_rooms_action.value;
  if (savedRoomsAction === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }
  if (savedRoomsAction === 'delete') {
    const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie den ausgewählten Raum löschen möchten?');
    if (isConfirmedDelete) { return true; }

    e.preventDefault();
    return false;
  }

  const rooms = document.getElementsByName('selectedRoom');
  let roomValue = false;

  rooms.forEach((room) => {
    if (room.checked) { roomValue = true; }
  });

  if (!roomValue) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus.' }); }

  return true;
}

export function validateConfigActions(e) {
  const configAction = document.forms.config_actions.config_actions_selection.value;
  if (configAction === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

  return true;
}

export function validateDisplayRooms(e) {
  const rooms = document.getElementsByName('selected-displayed-room');
  let roomChecked = false;

  rooms.forEach((room) => {
    if (room.checked) { roomChecked = true; }
  });

  if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie mindestens einen Tag aus.' }); }

  return true;
}

export function validateMaxFutureDate(e) {
  const num = document.getElementById('max-days-field').value;
  if (Number.isNaN(num)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }
  if (num === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

  return true;
}

export function validateMaxTime(e) {
  const numHours = document.getElementById('max-time-hours-field').value;
  if (numHours === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

  return true;
}

export function validateLimitRestriction(e) {
  const limitCount = document.getElementById('reservations-limit-field').value;
  if (limitCount === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Wert aus.' }); }

  return true;
}

export function validateRestrictCategories(e) {
  const numHours = document.getElementById('max-time-hours-field').value;
  if (numHours === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

  return true;
}

export function validateAddRooms(e, rooms) {
  const roomname = document.forms.addRoomForm['add-room-roomnumber'].value;
  const maxcapacity = document.forms.addRoomForm['add-room-maxcapacity'].value;
  const equipment = document.getElementsByName('selected-equipment');
  console.log(rooms, e);

  if (rooms.some((room) => room.roomnumber === roomname)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Diese Raumbezeichnung ist bereits vergeben.' }); }
  if (roomname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Raumbezeichnung an.' }); }
  if (maxcapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Maximalkapazität an.' }); }

  let equipmentChecked = false;
  equipment.forEach((item) => {
    if (item.checked) {
      equipmentChecked = true;
    }
  });

  if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie die Raumaustattung aus. Sollte der Raum über keine Austattung verfügen, wählen Sie \'nichts\' aus.' }); }

  return true;
}

export function validateEditRooms(e) {
  const editChoice = document.forms.editRoomsForm['edit-rooms-choice'].value;
  if (editChoice === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Aktion aus.' }); }

  return true;
}

export function validateEditRoomsRoom(e) {
  const roomname = document.forms.editRoomDetails['edit-rooms-room-roomnumber'].value;
  const maxcapacity = document.forms.editRoomDetails['edit-rooms-room-maxcapacity'].value;
  if (roomname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Raumbezeichnung darf nicht leer sein.' }); }
  if (maxcapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Maximalkapazität darf nicht leer sein.' }); }

  return true;
}

export function validateEditRoomsEquipment(e) {
  const equipment = document.getElementsByName('edit-rooms-current-equipment');
  let equipmentChecked = false;

  equipment.forEach((item) => {
    if (item.checked) {
      equipmentChecked = true;
    }
  });

  if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Raumaustattung darf nicht leer sein. Sollte der Raum über keine Austattung verfügen, geben Sie \'nichts\' an.' }); }

  return true;
}

export function deleteRoomConfirmation(e) {
  const rooms = document.getElementsByName('delete-room-radio-button');
  let roomChecked = false;

  rooms.forEach((room) => {
    if (room.checked) {
      roomChecked = true;
    }
  });

  if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie einen Raum aus, den Sie löschen möchten.' }); }
  const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie den ausgewählten Raum löschen möchten?');
  if (roomChecked && isConfirmedDelete) { return true; }

  e.preventDefault();
  return false;
}

export function validateAddEquipment(e) {
  const equipmentname = document.forms.addEquipment['add-equipment-text-field'].value;
  if (equipmentname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Austattungsbezeichnung darf nicht leer sein.' }); }

  return true;
}

export function editEquipmentValidation(e) {
  const equipment = document.getElementsByName('edit-equipment-radio-button');
  let equipmentChecked = false;

  equipment.forEach((item) => {
    if (item.checked) {
      equipmentChecked = true;
    }
  });

  if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Austattung aus, die Sie bearbeiten möchten.' }); }

  return true;
}

export function deleteEquipmentConfirmation(e) {
  const equipment = document.getElementsByName('delete-equipment-radio-button');
  let equipmentChecked = false;

  equipment.forEach((item) => {
    if (item.checked) {
      equipmentChecked = true;
    }
  });

  if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie eine Austattung aus, die Sie löschen möchten.' }); }

  const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie die ausgewählte Raumaustattung löschen möchten?');
  if (isConfirmedDelete) { return true; }

  e.preventDefault();
  return false;
}

export function validateAvailabilitySearchForOPAC(e) {
  const searchForm = {
    sd: {
      field: document.getElementById('availability-search-start-date'),
      value: document.getElementById('availability-search-start-date').value,
    },
    st: {
      field: document.getElementById('availability-search-start-time'),
      value: document.getElementById('availability-search-start-time').value,
    },
    ed: {
      field: document.getElementById('availability-search-end-date'),
      value: document.getElementById('availability-search-end-date').value,
    },
    et: {
      field: document.getElementById('availability-search-end-time'),
      value: document.getElementById('availability-search-end-time').value,
    },
    ro: {
      field: document.getElementById('availability-search-room'),
      value: document.getElementById('availability-search-room').value,
    },
  };

  const searchFormArray = Array.from(Object.entries(searchForm));

  searchFormArray.forEach((entry) => {
    const [, values] = entry;
    if (values.field.classList.contains('border-danger')) {
      values.field.classList.toggle('border-danger');
    }
  });

  const MINUTES_TO_MILLISECONDS = 60000;
  const MILLISECONDS_TO_HOURS = 3600000;

  const maximumBookableTimeframe = parseInt(document.getElementById('max_time').value, 10);
  const maximumBookableTimeframeInMilliseconds = maximumBookableTimeframe !== 0
    ? maximumBookableTimeframe * MINUTES_TO_MILLISECONDS
    : 0;
  const maximumBookableTimeframeInHours = maximumBookableTimeframeInMilliseconds !== 0 ? (
    maximumBookableTimeframeInMilliseconds / MILLISECONDS_TO_HOURS) % 24 : 0;

  const startTimestamp = `${searchForm.sd.value} ${searchForm.st.value}`;
  const endTimestamp = `${searchForm.ed.value} ${searchForm.et.value}`;

  const startTimestampInMilliseconds = Date.parse(startTimestamp);
  const endTimestampInMilliseconds = Date.parse(endTimestamp);

  const timeDifferenceInMilliseconds = endTimestampInMilliseconds - startTimestampInMilliseconds;

  if (
    timeDifferenceInMilliseconds > maximumBookableTimeframeInMilliseconds
    && maximumBookableTimeframeInMilliseconds > 0
  ) {
    let timeString = '';

    if (maximumBookableTimeframeInHours > 0) {
      timeString += `${maximumBookableTimeframeInHours} Stunde(n)`;
    }

    return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: `Die angegebene Zeitspanne übschreitet den Maximalwert: ${timeString}.` });
  }

  searchFormArray.forEach((entry) => {
    const [, values] = entry;
    if (values.value === '') {
      values.field.classList.toggle('border-danger');
    }
  });

  if (searchFormArray.some((entry) => {
    const [, values] = entry;
    return values.value === '';
  })) {
    e.preventDefault();
    return false;
  }

  return true;
}

export function getColorTextWithContrast(color) {
  let red = 0;
  let green = 0;
  let blue = 0;

  if (!color) {
    // Generate random RGB values
    red = Math.floor(Math.random() * 256 - 1);
    green = Math.floor(Math.random() * 256 - 1);
    blue = Math.floor(Math.random() * 256 - 1);
  }

  if (color) {
    [red, green, blue] = color.replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
    )
      .substring(1).match(/.{2}/g)
      .map((x) => parseInt(x, 16));
  }

  // Calculate brightness of randomized colour
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  // Calculate brightness of white and black text
  const lightText = (255 * 299 + 255 * 587 + 255 * 114) / 1000;
  const darkText = (0 * 299 + 0 * 587 + 0 * 114) / 1000;

  const backgroundColor = `rgb(${red},${green},${blue})`;
  const textColor = Math.abs(brightness - lightText) > Math.abs(brightness - darkText)
    ? 'rgb(255, 255, 255)'
    : 'rgb(0, 0, 0)';

  return [backgroundColor, textColor];
}

export function validateConfirmation(e) {
  const resLimit = document.getElementById('count-limit').value;
  const userLimit = document.getElementById('user-daily-limit').value;

  if (userLimit === resLimit && userLimit > 0 && e.submitter.name === 'confirmationSubmit') {
    return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Sie haben die maximale Anzahl an Reservierungen für Ihr Konto für diesen Tag erreicht.' });
  }

  return true;
}

export function renderCalendar() {
  const BREAKPOINT_SM = 768;
  const HTML = document.documentElement;
  const lmsrCalendarBody = document.querySelector('.lmsr-calendar-body');
  const lmsrCalendarBodyLandscape = document.getElementById('lmsr-calendar-body-landscape-template');
  const lmsrCalendarBodyPortrait = document.getElementById('lmsr-calendar-body-portrait-template');
  const lmsrCalendarBodyContent = HTML.clientWidth >= BREAKPOINT_SM
    ? lmsrCalendarBodyLandscape.content
    : lmsrCalendarBodyPortrait.content;

  lmsrCalendarBody.appendChild(lmsrCalendarBodyContent);

  const jumpToCalendarButton = document.getElementById('jump-to-calendar');
  const calendar = document.getElementById('study-room-calendar');
  jumpToCalendarButton.addEventListener('click', () => { calendar.scrollIntoView(); });
  jumpToCalendarButton.disabled = false;

  const daysWithBookingsInCalendar = document.querySelectorAll('.lmsr-calendar-data-entry');
  const activeBookingsInCalendar = document.querySelectorAll('.lmsr-calendar-data-booking');

  daysWithBookingsInCalendar.forEach((dayWithBookingsInCalendar) => {
    if (dayWithBookingsInCalendar.firstElementChild) {
      dayWithBookingsInCalendar.parentElement.classList.add('lmsr-calendar-data-has-events');
    }
  });

  activeBookingsInCalendar.forEach((activeBookingInCalendar) => {
    const { color } = activeBookingInCalendar.dataset;
    const ACTIVE_BOOKING_REFERENCE = activeBookingInCalendar;
    const [backgroundColor, textColor] = getColorTextWithContrast(color);
    ACTIVE_BOOKING_REFERENCE.style.backgroundColor = backgroundColor;
    ACTIVE_BOOKING_REFERENCE.style.color = textColor;
  });
}
