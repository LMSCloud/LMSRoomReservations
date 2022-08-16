/* eslint-disable no-unused-vars */
export function loadSelectedAction() { document.getElementById('actionSelectedBtn').click(); }

export function closeToast() {
  const lmsrToast = document.querySelector('.lmsr-toast');
  const lmsrToastButtonClose = document.querySelector('.lmsr-toast-button-close');
  lmsrToastButtonClose.addEventListener('click', () => { lmsrToast.remove(); });
  lmsrToastButtonClose.disabled = false;
  window.setTimeout(() => { lmsrToast.remove(); }, 3000);
}

export function validateOpeningHours(e) {
  const start = document.forms.OpeningHoursForm['opening-from'].value;
  const end = document.forms.OpeningHoursForm['opening-to'].value;

  const weekdays = document.querySelectorAll('input[name="weekdays"]:checked');
  if (weekdays.length === 0) { e.preventDefault(); alert("[% 'Please select at least one weekday.' | gettext %]"); return false; }
  if (end <= start || start === 0 || end === 0) { e.preventDefault(); alert("[% 'Please select valid start and end time.' | gettext %]"); return false; }

  return true;
}
export function validateBookingAction(e) {
  const action = document.forms.manageBookingsForm['manage-bookings-action'].value;
  const ids = document.getElementsByName('manage-bookings-id');

  let checked = 0;
  ids.forEach((id) => {
    if (id.checked) { checked += 1; }
  });

  if (checked !== 1) { e.preventDefault(); alert('Please make a selection to continue.'); return false; }
  if (action === '') { e.preventDefault(); alert('Please select an action to continue.'); return false; }

  return true;
}

export function validateManageBlackouts(e) {
  const actionChoice = document.forms.manageBlackoutsForm['manage-blackouts-action'].value;
  if (actionChoice === '') { e.preventDefault(); alert("[% 'Please select an action.' | gettext %]"); return false; }

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

  if (!validateDate(startDate)) { e.preventDefault(); alert("[% 'Start date is required.' | gettext %]"); return false; }
  if (!validateDate(endDate)) { e.preventDefault(); alert("[% 'End date is required.' | gettext %]"); return false; }

  rooms.forEach((room) => {
    if (room.checked) { roomChecked = true; }
  });

  if (!roomChecked) { e.preventDefault(); alert("[% 'Please select one or more rooms.' | gettext %]"); return false; }

  return true;
}

export function validatePartialBlackout(e) {
  const blackoutStartTime = document.forms.partialBlackoutForm['blackout-start-time'].value;
  const blackoutEndTime = document.forms.partialBlackoutForm['blackout-end-time'].value;
  const rooms = document.getElementsByName('current-room-blackout');
  let blackoutDate = document.forms.partialBlackoutForm['blackout-date'].value;
  let roomChecked = false;

  if (!validateDate(blackoutDate)) { e.preventDefault(); alert('Date is required.'); return false; }

  // convert date format from mm/dd/yyyy to yyyy-mm-dd
  blackoutDate = blackoutDate.replace(/(\d\d)\/(\d\d)\/(\d{4})/, '$3-$1-$2');

  // timestamp of MySQL type DATETIME
  const startTimestamp = `${blackoutDate}  ${blackoutStartTime}`;
  const endTimestamp = `${blackoutDate} ${blackoutEndTime}`;

  // determines if invalid start/end values were entered
  if (startTimestamp >= endTimestamp) { e.preventDefault(); alert("[% 'Please select a valid start and end time!' | gettext %]"); return false; }

  rooms.forEach((room) => {
    if (room.checked) { roomChecked = true; }
  });

  if (!roomChecked) { e.preventDefault(); alert("[% 'Please select one or more rooms.' | gettext %]"); return false; }

  return true;
}

export function setBlackoutValueOnChange(e) { e.target.value = e.target.value; }

export function validateAvailabilitySearchForBookas(e) {
  const startDate = document.forms.availabilitySearchForm['availability-search-start-date'].value;
  const startTime = document.forms.availabilitySearchForm['availability-search-start-time'].value;
  const endDate = document.forms.availabilitySearchForm['availability-search-end-date'].value;
  const endTime = document.forms.availabilitySearchForm['availability-search-end-time'].value;
  const maxCapacity = document.forms.availabilitySearchForm['availability-search-room-capacity'].value;

  if (startDate === '') { e.preventDefault(); alert("[% 'Start date is required.' | gettext %]"); return false; }
  if (startTime === '') { e.preventDefault(); alert("[% 'Start time is required.' | gettext %]"); return false; }
  if (endDate === '') { e.preventDefault(); alert("[% 'End date is required.' | gettext %]"); return false; }
  if (endTime === '') { e.preventDefault(); alert("[% 'End time is required.' | gettext %]"); return false; }
  if (maxCapacity === '') { e.preventDefault(); alert("[% 'Room capacity is required.' | gettext %]"); return false; }

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

  if (!roomChecked) { e.preventDefault(); alert("[% 'Select a room to continue.' | gettext %]"); return false; }

  return true;
}

export function validateSavedRooms(e) {
  const savedRoomsAction = document.forms.saved_rooms.saved_rooms_action.value;
  if (savedRoomsAction === 'null') { e.preventDefault(); alert("[% 'Please choose an action' | gettext %]"); return false; }
  if (savedRoomsAction === 'delete') {
    const isConfirmedDelete = !!confirm(" [% 'Are you sure you want to remove the selected room?' %]");
    if (isConfirmedDelete) { return true; }

    e.preventDefault();
    return false;
  }

  const rooms = document.getElementsByName('selectedRoom');
  let roomValue = false;

  rooms.forEach((room) => {
    if (room.checked) { roomValue = true; }
  });

  if (!roomValue) { e.preventDefault(); alert("[% 'Please select a room' | gettext %]"); return false; }

  return true;
}

export function validateConfigActions(e) {
  const configAction = document.forms.config_actions.config_actions_selection.value;
  if (configAction === 'null') { e.preventDefault(); alert("[% 'Please choose an action' | gettext %]"); return false; }

  return true;
}

export function validateDisplayRooms(e) {
  const rooms = document.getElementsByName('selected-displayed-room');
  let roomChecked = false;

  rooms.forEach((room) => {
    if (room.checked) { roomChecked = true; }
  });

  if (!roomChecked) { e.preventDefault(); alert("[% 'Select a room to display its details or select another action.' | gettext %]"); return false; }

  return true;
}

export function validateMaxFutureDate(e) {
  const num = document.getElementById('max-days-field').value;
  if (Number.isNaN(num)) { e.preventDefault(); alert("[% 'Please enter a valid number!' | gettext %]"); return false; }
  if (num === '') { e.preventDefault(); alert("[% 'Please enter a valid number!' | gettext %]"); return false; }

  return true;
}

export function validateMaxTime(e) {
  const numHours = document.getElementById('max-time-hours-field').value;
  if (numHours === 'null') { e.preventDefault(); alert("[% 'Please select a valid number!' | gettext %]"); return false; }

  return true;
}

export function validateLimitRestriction(e) {
  const limitCount = document.getElementById('reservations-limit-field').value;
  if (limitCount === 'null') { e.preventDefault(); alert('Please select a value!'); return false; }

  return true;
}

export function validateRestrictCategories(e) {
  const numHours = document.getElementById('max-time-hours-field').value;
  if (numHours === 'null') { e.preventDefault(); alert("[% 'Please select a valid number!' | gettext %]"); return false; }

  return true;
}

export function validateAddRooms(e, rooms) {
  const roomname = document.forms.addRoomForm['add-room-roomnumber'].value;
  const maxcapacity = document.forms.addRoomForm['add-room-maxcapacity'].value;
  const equipment = document.getElementsByName('selected-equipment');
  console.log(rooms, e);

  if (rooms.some((room) => room.roomnumber === roomname)) { e.preventDefault(); alert("[% 'Roomname is already taken' | gettext %]"); return false; }
  if (roomname === '') { e.preventDefault(); alert("[% 'Please enter a roomname' | gettext %]"); return false; }
  if (maxcapacity === '') { e.preventDefault(); alert("[% 'Please enter a max capacity for the room' | gettext %]"); return false; }

  let equipmentChecked = false;
  equipment.forEach((item) => {
    if (item.checked) {
      equipmentChecked = true;
    }
  });

  if (!equipmentChecked) { e.preventDefault(); alert("[% 'Select room equipment. If no equipment then check `none`' | gettext %]"); return false; }

  return true;
}

export function validateEditRooms(e) {
  const editChoice = document.forms.editRoomsForm['edit-rooms-choice'].value;
  if (editChoice === '') { e.preventDefault(); alert("[% 'Please select an edit action.' | gettext %]"); return false; }

  return true;
}

export function validateEditRoomsRoom(e) {
  const roomname = document.forms.editRoomDetails['edit-rooms-room-roomnumber'].value;
  const maxcapacity = document.forms.editRoomDetails['edit-rooms-room-maxcapacity'].value;
  if (roomname === '') { e.preventDefault(); alert("[% 'Room Name cannot be blank.' | gettext %]"); return false; }
  if (maxcapacity === '') { e.preventDefault(); alert("[% 'Max Capacity cannot be blank.' | gettext %]"); return false; }

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

  if (!equipmentChecked) { e.preventDefault(); alert("[% 'Room equipment cannot be empty. If no equipment then check `none`' | gettext %]"); return false; }

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

  if (!roomChecked) { e.preventDefault(); alert("[% 'Select a room to delete.' | gettext %]"); return false; }
  const isConfirmedDelete = !!confirm("[% 'Are you sure you want to delete the selected room?' | gettext %]");
  if (roomChecked && isConfirmedDelete) { return true; }

  e.preventDefault();
  return false;
}

export function validateAddEquipment(e) {
  const equipmentname = document.forms.addEquipment['add-equipment-text-field'].value;
  if (equipmentname === '') { e.preventDefault(); alert("[% 'Equipment name cannot be blank.' | gettext %]"); return false; }

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

  if (!equipmentChecked) { e.preventDefault(); alert("[% 'Select equipment to edit.' | gettext %]"); return false; }

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

  if (!equipmentChecked) { e.preventDefault(); alert("[% 'Select equipment to delete.' | gettext %]"); return false; }

  const isConfirmedDelete = !!confirm("[% 'Are you sure you want to delete the selected equipment?' | gettext %]");
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
      timeString += `${maximumBookableTimeframeInHours} [% 'hours' | gettext %]`;
    }

    e.preventDefault();
    alert(
      `[% 'Selected time range exceeds maximum time allowed of' | gettext %] ${timeString}!`,
    );
    return false;
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
    e.preventDefault();
    alert("[% 'Unable to continue!\nYou have reached the limit of daily reservations per user for today!' | gettext %]");
    return false;
  }

  return true;
}
