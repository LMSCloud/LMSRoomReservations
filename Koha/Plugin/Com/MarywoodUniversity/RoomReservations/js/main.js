(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.RoomReservationBundle = {}));
})(this, (function (exports) { 'use strict';

  /* eslint-disable no-unused-vars */
  function loadSelectedAction() { document.getElementById('actionSelectedBtn').click(); }

  function closeToast() {
    const lmsrToast = document.querySelector('.lmsr-toast');
    const lmsrToastButtonClose = document.querySelector('.lmsr-toast-button-close');
    lmsrToastButtonClose.addEventListener('click', () => { lmsrToast.remove(); });
    lmsrToastButtonClose.disabled = false;
    window.setTimeout(() => { lmsrToast.remove(); }, 3000);
  }

  function validateOpeningHours(e) {
    const start = document.forms.OpeningHoursForm['opening-from'].value;
    const end = document.forms.OpeningHoursForm['opening-to'].value;

    const weekdays = document.querySelectorAll('input[name="weekdays"]:checked');
    if (weekdays.length === 0) { e.preventDefault(); return false; }
    if (end <= start || start === 0 || end === 0) { e.preventDefault(); return false; }

    return true;
  }
  function validateBookingAction(e) {
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

  function validateManageBlackouts(e) {
    const actionChoice = document.forms.manageBlackoutsForm['manage-blackouts-action'].value;
    if (actionChoice === '') { e.preventDefault(); alert("[% 'Please select an action.' | gettext %]"); return false; }

    return true;
  }

  function validateDate(dateStr) { return true; }
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

  function validateFullBlackout(e) {
    document.forms.fullBlackoutForm['blackout-start-date'].value;
    document.forms.fullBlackoutForm['blackout-end-date'].value;
    const rooms = document.getElementsByName('current-room-blackout');
    let roomChecked = false;

    rooms.forEach((room) => {
      if (room.checked) { roomChecked = true; }
    });

    if (!roomChecked) { e.preventDefault(); alert("[% 'Please select one or more rooms.' | gettext %]"); return false; }

    return true;
  }

  function validatePartialBlackout(e) {
    const blackoutStartTime = document.forms.partialBlackoutForm['blackout-start-time'].value;
    const blackoutEndTime = document.forms.partialBlackoutForm['blackout-end-time'].value;
    const rooms = document.getElementsByName('current-room-blackout');
    let blackoutDate = document.forms.partialBlackoutForm['blackout-date'].value;
    let roomChecked = false;

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

  function setBlackoutValueOnChange(e) { e.target.value = e.target.value; }

  function validateAvailabilitySearchForBookas(e) {
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

  function validateAvailabilitySearchResultsForBookas(e) {
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

  function validateSavedRooms(e) {
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

  function validateConfigActions(e) {
    const configAction = document.forms.config_actions.config_actions_selection.value;
    if (configAction === 'null') { e.preventDefault(); alert("[% 'Please choose an action' | gettext %]"); return false; }

    return true;
  }

  function validateDisplayRooms(e) {
    const rooms = document.getElementsByName('selected-displayed-room');
    let roomChecked = false;

    rooms.forEach((room) => {
      if (room.checked) { roomChecked = true; }
    });

    if (!roomChecked) { e.preventDefault(); alert("[% 'Select a room to display its details or select another action.' | gettext %]"); return false; }

    return true;
  }

  function validateMaxFutureDate(e) {
    const num = document.getElementById('max-days-field').value;
    if (Number.isNaN(num)) { e.preventDefault(); alert("[% 'Please enter a valid number!' | gettext %]"); return false; }
    if (num === '') { e.preventDefault(); alert("[% 'Please enter a valid number!' | gettext %]"); return false; }

    return true;
  }

  function validateMaxTime(e) {
    const numHours = document.getElementById('max-time-hours-field').value;
    if (numHours === 'null') { e.preventDefault(); alert("[% 'Please select a valid number!' | gettext %]"); return false; }

    return true;
  }

  function validateLimitRestriction(e) {
    const limitCount = document.getElementById('reservations-limit-field').value;
    if (limitCount === 'null') { e.preventDefault(); alert('Please select a value!'); return false; }

    return true;
  }

  function validateRestrictCategories(e) {
    const numHours = document.getElementById('max-time-hours-field').value;
    if (numHours === 'null') { e.preventDefault(); alert("[% 'Please select a valid number!' | gettext %]"); return false; }

    return true;
  }

  function validateAddRooms(e) {
    const roomname = document.forms.addRoomForm['add-room-roomnumber'].value;
    const maxcapacity = document.forms.addRoomForm['add-room-maxcapacity'].value;
    const equipment = document.getElementsByName('selected-equipment');

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

  function validateEditRooms(e) {
    const editChoice = document.forms.editRoomsForm['edit-rooms-choice'].value;
    if (editChoice === '') { e.preventDefault(); alert("[% 'Please select an edit action.' | gettext %]"); return false; }

    return true;
  }

  function validateEditRoomsRoom(e) {
    const roomname = document.forms.editRoomDetails['edit-rooms-room-roomnumber'].value;
    const maxcapacity = document.forms.editRoomDetails['edit-rooms-room-maxcapacity'].value;
    if (roomname === '') { e.preventDefault(); alert("[% 'Room Name cannot be blank.' | gettext %]"); return false; }
    if (maxcapacity === '') { e.preventDefault(); alert("[% 'Max Capacity cannot be blank.' | gettext %]"); return false; }

    return true;
  }

  function validateEditRoomsEquipment(e) {
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

  function deleteRoomConfirmation(e) {
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

  function validateAddEquipment(e) {
    const equipmentname = document.forms.addEquipment['add-equipment-text-field'].value;
    if (equipmentname === '') { e.preventDefault(); alert("[% 'Equipment name cannot be blank.' | gettext %]"); return false; }

    return true;
  }

  function editEquipmentValidation(e) {
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

  function deleteEquipmentConfirmation(e) {
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

  exports.closeToast = closeToast;
  exports.deleteEquipmentConfirmation = deleteEquipmentConfirmation;
  exports.deleteRoomConfirmation = deleteRoomConfirmation;
  exports.editEquipmentValidation = editEquipmentValidation;
  exports.loadSelectedAction = loadSelectedAction;
  exports.setBlackoutValueOnChange = setBlackoutValueOnChange;
  exports.validateAddEquipment = validateAddEquipment;
  exports.validateAddRooms = validateAddRooms;
  exports.validateAvailabilitySearchForBookas = validateAvailabilitySearchForBookas;
  exports.validateAvailabilitySearchResultsForBookas = validateAvailabilitySearchResultsForBookas;
  exports.validateBookingAction = validateBookingAction;
  exports.validateConfigActions = validateConfigActions;
  exports.validateDate = validateDate;
  exports.validateDisplayRooms = validateDisplayRooms;
  exports.validateEditRooms = validateEditRooms;
  exports.validateEditRoomsEquipment = validateEditRoomsEquipment;
  exports.validateEditRoomsRoom = validateEditRoomsRoom;
  exports.validateFullBlackout = validateFullBlackout;
  exports.validateLimitRestriction = validateLimitRestriction;
  exports.validateManageBlackouts = validateManageBlackouts;
  exports.validateMaxFutureDate = validateMaxFutureDate;
  exports.validateMaxTime = validateMaxTime;
  exports.validateOpeningHours = validateOpeningHours;
  exports.validatePartialBlackout = validatePartialBlackout;
  exports.validateRestrictCategories = validateRestrictCategories;
  exports.validateSavedRooms = validateSavedRooms;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
