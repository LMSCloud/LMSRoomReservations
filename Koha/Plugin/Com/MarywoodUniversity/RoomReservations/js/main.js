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

  exports.closeToast = closeToast;
  exports.loadSelectedAction = loadSelectedAction;
  exports.setBlackoutValueOnChange = setBlackoutValueOnChange;
  exports.validateAvailabilitySearchForBookas = validateAvailabilitySearchForBookas;
  exports.validateAvailabilitySearchResultsForBookas = validateAvailabilitySearchResultsForBookas;
  exports.validateBookingAction = validateBookingAction;
  exports.validateDate = validateDate;
  exports.validateFullBlackout = validateFullBlackout;
  exports.validateManageBlackouts = validateManageBlackouts;
  exports.validateOpeningHours = validateOpeningHours;
  exports.validatePartialBlackout = validatePartialBlackout;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
