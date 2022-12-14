(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.RoomReservationBundle = {}));
})(this, (function (exports) { 'use strict';

  const template$2 = document.createElement('template');
  template$2.innerHTML = `
  <div class="lmsr-toast">
    <div class="lmsr-toast-header">
      <strong>&excl;</strong>
      <slot name="title"></slot>
      <button type="button" class="lmsr-button-close lmsr-toast-button-close" aria-label="Close" disabled>
        <span aria-hidden="true">&times;</i></span>
      </button>
    </div>
    <div class="lmsr-toast-body">
      <slot name="message"></slot>
    </div>
  </div>
  <style>
    @import url('/api/v1/contrib/roomreservations/static/css/main.css');
  </style>
`;

  class LmsrToast extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: 'open' });
      this.shadowRoot.append(template$2.content.cloneNode(true));
    }

    connectedCallback() {
      const lmsrToast = this.shadowRoot.querySelector('.lmsr-toast');
      const lmsrToastButtonClose = this.shadowRoot.querySelector('.lmsr-toast-button-close');
      lmsrToastButtonClose.addEventListener('click', () => { lmsrToast.remove(); });
      lmsrToastButtonClose.disabled = false;
      window.setTimeout(() => { lmsrToast.remove(); }, 3000);
    }
  }

  const template$1 = document.createElement('template');
  template$1.innerHTML = `
  <slot name="lmsr-check-input"></slot>
  <slot name="lmsr-check-label"></slot>
  <style>
    @import url('/api/v1/contrib/roomreservations/static/css/main.css');
  </style>
`;

  class LmsrEquipmentSelection extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: 'open' });
      this.shadowRoot.append(template$1.content.cloneNode(true));
    }
  }

  const template = document.createElement('template');
  template.innerHTML = `
  <div class="lmsr-edit-modal">
    <div class="lmsr-edit-modal-header">
      <strong>&quest;</strong>
      <slot name="title"></slot>
      <button type="button" class="lmsr-button-close lmsr-modal-button-close" aria-label="Close" disabled>
        <span aria-hidden="true">&times;</i></span>
      </button>
    </div>
    <slot name="content"></slot>
    <slot name="hidden-inputs"></slot>
    <slot name="submit"></slot>
  </div>
  <style>
    @import url('/api/v1/contrib/roomreservations/static/css/main.css');
  </style>
`;

  class LmsrEditModal extends HTMLElement {
    constructor() {
      super();

      this.attachShadow({ mode: 'open' });
      this.shadowRoot.append(template.content.cloneNode(true));
    }

    connectedCallback() {
      const lmsrEditModal = document.querySelector('lmsr-edit-modal');
      const lmsrModalButtonClose = this.shadowRoot.querySelector('.lmsr-modal-button-close');
      lmsrModalButtonClose.addEventListener('click', () => { lmsrEditModal.remove(); });
      lmsrModalButtonClose.disabled = false;
    }
  }

  function closeModal({ selector }) {
    const lmsrModal = document.querySelector(selector);
    const lmsrModalRoot = lmsrModal.shadowRoot;
    const lmsrModalButtonClose = lmsrModalRoot.querySelector('.lmsr-modal-button-close');
    lmsrModalButtonClose.addEventListener('click', () => { lmsrModal.remove(); });
    lmsrModalButtonClose.disabled = false;
  }

  function closeToast() {
    const lmsrToast = document.querySelector('lmsr-toast');
    const lmsrToastRoot = lmsrToast.shadowRoot;
    const lmsrToastButtonClose = lmsrToastRoot.querySelector('.lmsr-toast-button-close');
    lmsrToastButtonClose.addEventListener('click', () => { lmsrToast.remove(); });
    lmsrToastButtonClose.disabled = false;
    window.setTimeout(() => { lmsrToast.remove(); }, 3000);
  }

  function getBlackoutsBySelectedRoom({ entryPoint, blackouts }) {
    const showBlackoutHint = (entryPointRef) => {
      const blackoutInfo = document.createElement('span');
      blackoutInfo.classList.add('row', 'mx-1', 'p-1');
      blackoutInfo.textContent = 'F??r diesen Raum existieren derzeit keine Sperrzeiten.';
      entryPointRef.appendChild(blackoutInfo);
      return false;
    };

    const entryPointRef = document.getElementById(entryPoint);
    entryPointRef.innerHTML = '';
    let [selectedRoom] = document.getElementById('availability-search-room').selectedOptions;
    if (!+selectedRoom.value) { return showBlackoutHint(entryPointRef); }
    selectedRoom = selectedRoom.text.replace(/\(.*\)/, '').trim();
    const blackoutsForSelectedRoom = blackouts.reduce((accumulator, blackout) => {
      if (blackout.roomnumber === selectedRoom) { accumulator.push(blackout); }
      return accumulator;
    }, []);
    if (blackoutsForSelectedRoom.length === 0) {
      return showBlackoutHint(entryPointRef);
    }
    blackoutsForSelectedRoom.forEach((blackout) => {
      const blackoutElement = document.createElement('div');
      blackoutElement.classList.add('row', 'my-3', 'mx-1', 'p-1', 'border', 'rounded', 'text-center');
      [blackout.start, '-', blackout.end].forEach((item) => {
        const span = document.createElement('div');
        span.classList.add('text-nowrap', 'col-12', 'col-xl-4');
        span.textContent = item;
        blackoutElement.appendChild(span);
      });
      entryPointRef.appendChild(blackoutElement);
    });

    return true;
  }

  function getCheckedOptions({ elements, hiddenInputReference }) {
    const hiddenInput = document.getElementById(hiddenInputReference);
    const options = document.querySelectorAll(elements);
    options.forEach((option) => {
      option.addEventListener('change', () => {
        const checkedOptions = Array.from(options).reduce((accumulator, _option) => {
          if (_option.checked) { accumulator.push(_option.value); } return accumulator;
        }, []);
        hiddenInput.value = checkedOptions;
      });
    });
  }

  function getColorTextWithContrast(color) {
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

  function getEquipmentBySelectedRoom({
    rooms,
    equipment,
    entryPoint,
  }) {
    const showEquipmentHint = (entryPointRef) => {
      const equipmentInfo = document.createElement('span');
      equipmentInfo.classList.add('row', 'mx-1', 'p-1');
      equipmentInfo.textContent = 'F??r diesen Raum konnte kein Equipment gefunden werden.';
      entryPointRef.appendChild(equipmentInfo);
      return false;
    };

    const entryPointRef = document.getElementById(entryPoint);
    entryPointRef.innerHTML = '';
    const [selectedRoom] = document.getElementById(
      'availability-search-room',
    ).selectedOptions;
    if (!+selectedRoom.value) {
      return showEquipmentHint(entryPointRef);
    }
    const roomData = rooms.find(
      (room) => room.roomnumber === selectedRoom.text.replace(/\(.*\)/, '').trim(),
    );
    roomData?.equipment.forEach((item) => {
      const lmsrEquipmentSelectionCheckForm = document.createElement(
        'lmsr-equipment-selection',
        { is: 'lmsr-equipment-selection' },
      );
      const itemMachineReadable = item.equipmentname.replace(' ', '_');
      const itemId = equipment.find(
        (_item) => _item.equipmentname === item.equipmentname,
      ).equipmentid;
      lmsrEquipmentSelectionCheckForm.innerHTML = `
        <input slot="lmsr-check-input" class="lmsr-check-input" type="checkbox" value="${itemId}" id="${itemMachineReadable}">
        <label slot="lmsr-check-label" class="lmsr-check-label" for="${itemMachineReadable}">${item.equipmentname}</label>
      `;
      entryPointRef.appendChild(
        lmsrEquipmentSelectionCheckForm,
      );
    });

    return true;
  }

  function hydrateAvailabilitySearch({
    roomSelectionRef,
    blackoutsArgs,
    equipmentArgs,
    checkedOptionsArgs,
  }) {
    if (roomSelectionRef) {
      Array.from(roomSelectionRef.selectedOptions).forEach((selectedOption) => {
        const selectedOptionRef = selectedOption;
        selectedOptionRef.selected = false;
      });
    }
    getBlackoutsBySelectedRoom({
      entryPoint: blackoutsArgs.entryPoint,
      blackouts: blackoutsArgs.blackouts,
    });
    getEquipmentBySelectedRoom({
      entryPoint: equipmentArgs.entryPoint,
      rooms: equipmentArgs.rooms,
      equipment: equipmentArgs.equipment,
    });
    getCheckedOptions({
      elements: checkedOptionsArgs.elements,
      hiddenInputReference: checkedOptionsArgs.hiddenInputReference,
    });
  }

  function hydrateRoomConfinement() {
    const roomConfinementItems = document.querySelectorAll(
      '.lmsr-calendar-room-confinement-item',
    );
    const bookingsLandscape = document.querySelectorAll(
      '.lmsr-calendar-data-booking',
    );

    const bookingsPortrait = document.querySelectorAll(
      '.lmsr-calendar-portrait-day-booking',
    );

    const bookings = bookingsLandscape.length > 0 ? bookingsLandscape : bookingsPortrait;
    const format = bookingsLandscape.length > 0;

    const resetVisibility = ({ e, _bookings }) => {
      roomConfinementItems.forEach((roomConfinementItem) => {
        if (
          roomConfinementItem.textContent.trim() !== e.target.textContent.trim()
        ) {
          const ref = roomConfinementItem;
          ref.dataset.active = 'false';
        }
      });
      _bookings.forEach((booking) => {
        const ref = booking;
        ref.style.display = format ? 'block' : 'flex';
      });
    };

    const toggleVisibility = ({ e, _bookings }) => {
      resetVisibility({ e, _bookings });
      const state = e.target.dataset.active === 'true';
      e.target.dataset.active = !state;

      _bookings.forEach((booking) => {
        const ref = booking;
        if (
          !(
            booking.firstElementChild.textContent.trim()
            === e.target.textContent.trim()
          )
        ) {
          ref.style.display = state ? `${format ? 'block' : 'flex'}` : 'none';
        }
      });
    };

    roomConfinementItems.forEach((roomConfinementItem) => {
      const ref = roomConfinementItem;
      if (
        !Array.from(bookings).some(
          (booking) => booking.firstElementChild.textContent.trim()
            === roomConfinementItem.textContent.trim(),
        )
      ) {
        ref.style.display = 'none';
      }
      roomConfinementItem.addEventListener('click', (e) => {
        toggleVisibility({ e, _bookings: bookings });
      });
    });
  }

  function loadSelectedAction() { document.getElementById('actionSelectedBtn').click(); }

  function notifyOnSubmitWithMessage({ type, message, style = null }) {
    const lmsrNotifications = document.getElementById('lmsr-notifications');
    lmsrNotifications.innerHTML = '';
    const lmsrToast = document.createElement('lmsr-toast', { is: 'lmsr-toast' });
    lmsrToast.innerHTML = `
      <strong slot="title">${type}</strong>
      <p slot="message">${message}</p>
    `;
    const lmsrToastDiv = lmsrToast.shadowRoot.querySelector('.lmsr-toast');
    if (style) {
      style.forEach((directive) => {
        const { key, value } = directive;
        lmsrToastDiv.style[key] = value;
      });
    }

    lmsrNotifications.appendChild(lmsrToast);
  }

  function prohibitFormSubmitWithMessage({
    e,
    type,
    message,
    style = [
      { key: 'bottom', value: '3.5em' },
      { key: 'right', value: '1em' },
    ],
  }) {
    e.preventDefault();
    const lmsrNotifications = document.getElementById('lmsr-notifications');
    lmsrNotifications.innerHTML = '';
    const lmsrToast = document.createElement('lmsr-toast', { is: 'lmsr-toast' });
    lmsrToast.innerHTML = `
      <strong slot="title">${type}</strong>
      <p slot="message">${message}</p>
      ${style ? `<style>${style}</style>` : ''}
    `;
    const lmsrToastDiv = lmsrToast.shadowRoot.querySelector('.lmsr-toast');
    if (style) {
      style.forEach((directive) => {
        const { key, value } = directive;
        lmsrToastDiv.style[key] = value;
      });
    }
    lmsrNotifications.appendChild(lmsrToast);

    return false;
  }

  function renderCalendar() {
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

  function setBlackoutValueOnChange(e) { e.target.value = e.target.value; }

  function deleteEquipmentConfirmation(e) {
    const equipment = document.getElementsByName('delete-equipment-radio-button');
    let equipmentChecked = false;

    equipment.forEach((item) => {
      if (item.checked) {
        equipmentChecked = true;
      }
    });

    if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie eine Austattung aus, die Sie l??schen m??chten.' }); }

    const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie die ausgew??hlte Raumaustattung l??schen m??chten?');
    if (isConfirmedDelete) { return true; }

    e.preventDefault();
    return false;
  }

  function deleteRoomConfirmation(e) {
    const rooms = document.getElementsByName('delete-room-radio-button');
    let roomChecked = false;

    rooms.forEach((room) => {
      if (room.checked) {
        roomChecked = true;
      }
    });

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie einen Raum aus, den Sie l??schen m??chten.' }); }
    const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie den ausgew??hlten Raum l??schen m??chten?');
    if (roomChecked && isConfirmedDelete) { return true; }

    e.preventDefault();
    return false;
  }

  function editEquipmentValidation(e) {
    const equipment = document.getElementsByName('edit-equipment-radio-button');
    let equipmentChecked = false;

    equipment.forEach((item) => {
      if (item.checked) {
        equipmentChecked = true;
      }
    });

    if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie eine Austattung aus, die Sie bearbeiten m??chten.' }); }

    return true;
  }

  function validateAddEquipment(e) {
    const equipmentname = document.forms.addEquipment['add-equipment-text-field'].value;
    if (equipmentname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Austattungsbezeichnung darf nicht leer sein.' }); }

    return true;
  }

  function validateAddRooms(e, rooms) {
    const roomname = document.forms.addRoomForm['add-room-roomnumber'].value;
    const maxcapacity = document.forms.addRoomForm['add-room-maxcapacity'].value;
    const equipment = document.getElementsByName('selected-equipment');

    if (rooms.some((room) => room.roomnumber === roomname)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Diese Raumbezeichnung ist bereits vergeben.' }); }
    if (roomname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Raumbezeichnung an.' }); }
    if (maxcapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Maximalkapazit??t an.' }); }

    let equipmentChecked = false;
    equipment.forEach((item) => {
      if (item.checked) {
        equipmentChecked = true;
      }
    });

    if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie die Raumaustattung aus. Sollte der Raum ??ber keine Austattung verf??gen, w??hlen Sie \'nichts\' aus.' }); }

    return true;
  }

  function validateAvailabilitySearchForBookas(e) {
    const startDate = document.forms.availabilitySearchForm['availability-search-start-date'].value;
    const startTime = document.forms.availabilitySearchForm['availability-search-start-time'].value;
    const endDate = document.forms.availabilitySearchForm['availability-search-end-date'].value;
    const endTime = document.forms.availabilitySearchForm['availability-search-end-time'].value;
    const maxCapacity = document.forms.availabilitySearchForm['availability-search-room-capacity'].value;

    if (startDate === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Startdatum an.' }); }
    if (startTime === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Startzeit an.' }); }
    if (endDate === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Enddatum an.' }); }
    if (endTime === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie ein Endzeit an.' }); }
    if (maxCapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie einen Raum aus.' }); }

    return true;
  }

  function validateAvailabilitySearchForOPAC({ e, rooms }) {
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

    const maximumBookableTimeframeOfSelectedRoom = rooms?.find(
      (room) => room.roomid === searchForm.ro.value,
    )?.maxbookabletime;
    const searchFormArray = Array.from(Object.entries(searchForm));

    searchFormArray.forEach((entry) => {
      const [, values] = entry;
      if (values.field.classList.contains('border-danger')) {
        values.field.classList.toggle('border-danger');
      }
    });

    const MINUTES_TO_MILLISECONDS = 60000;
    const MILLISECONDS_TO_HOURS = 3600000;
    const MINUTES_IN_HOURS = 60;

    const maximumBookableTimeframe = maximumBookableTimeframeOfSelectedRoom
      || parseInt(document.getElementById('max_time').value, 10);
    const maximumBookableTimeframeInMilliseconds = maximumBookableTimeframe !== 0
      ? maximumBookableTimeframe * MINUTES_TO_MILLISECONDS
      : 0;
    const maximumBookableTimeframeInHours = maximumBookableTimeframeInMilliseconds !== 0
      ? (maximumBookableTimeframeInMilliseconds / MILLISECONDS_TO_HOURS) % 24
      : 0;

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
        timeString
          += maximumBookableTimeframeInHours < 1
            ? `${MINUTES_IN_HOURS * maximumBookableTimeframeInHours} Minuten`
            : `${maximumBookableTimeframeInHours} Stunde(n)`;
      }

      return prohibitFormSubmitWithMessage({
        e,
        type: 'Warnung',
        message: `Die angegebene Zeitspanne ??berschreitet den Maximalwert: ${timeString}.`,
        style: [
          { key: 'bottom', value: '1em' },
          { key: 'right', value: '1em' },
        ],
      });
    }

    searchFormArray.forEach((entry) => {
      const [, values] = entry;
      if (values.value === '' || values.value === '0') {
        values.field.classList.toggle('border-danger');
      }
    });

    if (
      searchFormArray.some((entry) => {
        const [, values] = entry;
        return values.value === '';
      })
    ) {
      e.preventDefault();
      return false;
    }

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

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie einen Raum aus um fortzufahren.' }); }

    return true;
  }

  function validateBookingAction({
    e,
    bookings,
    equipment,
    rooms,
  }) {
    const action = document.forms.manageBookingsForm['manage-bookings-action'].value;
    const ids = document.getElementsByName('manage-bookings-id');

    let checked = 0;
    ids.forEach((id) => {
      if (id.checked) {
        checked += 1;
      }
    });

    if (checked !== 1) {
      return prohibitFormSubmitWithMessage({
        e,
        type: 'Warnung',
        message: 'Bitte w??hlen Sie eine Aktion aus.',
      });
    }
    if (action === '') {
      return prohibitFormSubmitWithMessage({
        e,
        type: 'Warnung',
        message: 'Bitte w??hlen Sie eine Aktion aus.',
      });
    }

    const id = Array.from(ids).find((_id) => _id.checked).value;
    const booking = bookings.find((_booking) => _booking.bookingid === id);
    const bookedEquipment = booking.equipment?.reduce((accumulator, itemId) => {
      accumulator.push(
        equipment.find((item) => item.equipmentid === itemId.toString()),
      );
      return accumulator;
    }, []);
    const roomnumbers = rooms.map((room) => room.roomnumber);

    /* Target format is yyyy-MM-ddThh:mm */
    const convertToDatetimeLocal = (datetime) => {
      const [date, time] = datetime.split(' ');
      const [day, month, year] = date.split('.');
      const [hours, minutes] = time.split(':');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    };

    /* Target format is 'yyyy-MM-dd hh:mm:ss' */
    const convertToDatabaseFormat = (datetime) => `${datetime.replace('T', ' ')}:00`;

    const getFieldsForBookingEdit = ({
      _booking,
      _equipment,
      _bookedEquipment,
      _roomnumbers,
    }) => `
      <label for="edit-booking-roomnumber">Raum</label>
      <select name="edit-booking-roomnumber" id="edit-booking-roomnumber">
        <option value="${_booking.roomnumber}">${_booking.roomnumber}</option>
        ${_roomnumbers
    .filter((roomnumber) => roomnumber !== _booking.roomnumber)
    .reduce(
      (accumulator, roomnumber) => `
          ${accumulator}
          <option value="${roomnumber}">${roomnumber}</option>
        `,
      '',
    )}
      </select>
      <label for="edit-booking-start">Start</label>
      <input type="datetime-local" name="edit-booking-start" id="edit-booking-start" value="${convertToDatetimeLocal(
    _booking.start,
  )}">
      <label for="edit-booking-end">Ende</label>
      <input type="datetime-local" name="edit-booking-end" id="edit-booking-end" value="${convertToDatetimeLocal(
    _booking.end,
  )}">
      <label for="edit-booking-equipment">Austattung</label>
      <select name="edit-booking-equipment" id="edit-booking-equipment" multiple>
        ${
  _bookedEquipment
    ? _bookedEquipment.reduce(
      (accumulator, bookedItem) => `
      ${accumulator}
      <option value="${bookedItem.equipmentid}" selected>${bookedItem.equipmentname}</option>
      `,
      '',
    )
    : ''
}
        ${
  _equipment
    ? _equipment
      .filter((item) => (_bookedEquipment ? !_bookedEquipment.includes(item) : item))
      .reduce(
        (accumulator, item) => `
      ${accumulator}
      <option value="${item.equipmentid}">${item.equipmentname}</option>`,
        '',
      )
    : ''
}
      </select>
    `;
    const getHiddenFieldsForBookingEdit = (bookingid) => `
      <input type="hidden" name="edit-booking-id" id="edit-booking-id" value="${bookingid}"/>
    `;
    const getSubmitButtonForBookingEdit = () => `
      <input type="submit" name="submit-edit-booking" id="submit-edit-booking" value="Best??tigen" />
    `;

    if (action === 'edit') {
      e.preventDefault();
      // FIXME: Title slot should be dynamic in the future
      const entryPoint = document.getElementById('lmsr-edit-modal');
      entryPoint.innerHTML = '';
      const lmsrEditModal = document.createElement('lmsr-edit-modal', {
        is: 'lmsr-edit-modal',
      });
      lmsrEditModal.innerHTML = `
      <strong slot="title">Buchung bearbeiten</strong>
      <div slot="content" class="lmsr-edit-modal-body">${getFieldsForBookingEdit(
    {
      _booking: booking,
      _equipment: equipment,
      _bookedEquipment: bookedEquipment,
      _roomnumbers: roomnumbers,
    },
  )}</div>
      <div slot="hidden-inputs" class="lmsr-hidden-inputs">${getHiddenFieldsForBookingEdit(
    booking.bookingid,
  )}</div>
      <div slot="submit">${getSubmitButtonForBookingEdit()}</div>
      `;
      entryPoint.appendChild(lmsrEditModal);
      entryPoint.style.display = 'block';

      const submitEditBookingButton = document.getElementById(
        'submit-edit-booking',
      );
      submitEditBookingButton.addEventListener('click', () => {
        const hiddenInputRoomnumber = document.getElementById(
          'edited-booking-roomnumber',
        );
        const hiddenInputStart = document.getElementById('edited-booking-start');
        const hiddenInputEnd = document.getElementById('edited-booking-end');
        const hiddenInputEquipment = document.getElementById(
          'edited-booking-equipment',
        );
        const hiddenInputId = document.getElementById('edited-booking-id');

        hiddenInputRoomnumber.value = rooms.find(
          (room) => room.roomnumber
            === document.getElementById('edit-booking-roomnumber').value,
        ).roomid;
        hiddenInputStart.value = convertToDatabaseFormat(
          document.getElementById('edit-booking-start').value,
        );
        hiddenInputEnd.value = convertToDatabaseFormat(
          document.getElementById('edit-booking-end').value,
        );
        hiddenInputEquipment.value = Array.from(
          document.getElementById('edit-booking-equipment').childNodes,
        )
          .filter((item) => item.nodeName === 'OPTION')
          .filter((item) => item.selected)
          .reduce((accumulator, item) => `${accumulator},${item.value}`, '')
          .replace(/^,|,$/g, '');
        hiddenInputId.value = document.getElementById('edit-booking-id').value;

        e.target.submit();
      });

      return false;
    }

    return true;
  }

  function validateConfigActions(e) {
    const configAction = document.forms.config_actions.config_actions_selection.value;
    if (configAction === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie eine Aktion aus.' }); }

    return true;
  }

  function validateConfirmation(e) {
    const resLimit = document.getElementById('count-limit').value;
    const userLimit = document.getElementById('user-daily-limit').value;

    if (userLimit === resLimit && userLimit > 0 && e.submitter.name === 'confirmationSubmit') {
      return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Sie haben die maximale Anzahl an Reservierungen f??r Ihr Konto f??r diesen Tag erreicht.' });
    }

    return true;
  }

  function validateDate(/* dateStr */) { return true; }
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

  function validateDisplayRooms(e) {
    const rooms = document.getElementsByName('selected-displayed-room');
    let roomChecked = false;

    rooms.forEach((room) => {
      if (room.checked) { roomChecked = true; }
    });

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie mindestens einen Tag aus.' }); }

    return true;
  }

  function validateEditRooms(e) {
    const editChoice = document.forms.editRoomsForm['edit-rooms-choice'].value;
    if (editChoice === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie eine Aktion aus.' }); }

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

    if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Raumaustattung darf nicht leer sein. Sollte der Raum ??ber keine Austattung verf??gen, geben Sie \'nichts\' an.' }); }

    return true;
  }

  function validateEditRoomsRoom(e) {
    const roomname = document.forms.editRoomDetails['edit-rooms-room-roomnumber'].value;
    const maxcapacity = document.forms.editRoomDetails['edit-rooms-room-maxcapacity'].value;
    if (roomname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Raumbezeichnung darf nicht leer sein.' }); }
    if (maxcapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Maximalkapazit??t darf nicht leer sein.' }); }

    return true;
  }

  function validateFullBlackout(e) {
    document.forms.fullBlackoutForm['blackout-start-date'].value;
    document.forms.fullBlackoutForm['blackout-end-date'].value;
    const rooms = document.getElementsByName('current-room-blackout');
    let roomChecked = false;

    rooms.forEach((room) => {
      if (room.checked) { roomChecked = true; }
    });

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie einen Raum oder mehrere R??ume aus.' }); }

    return true;
  }

  function validateLimitRestriction(e) {
    const limitCount = document.getElementById('reservations-limit-field').value;
    if (limitCount === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie einen Wert aus.' }); }

    return true;
  }

  function validateManageBlackouts(e) {
    const actionChoice = document.forms.manageBlackoutsForm['manage-blackouts-action'].value;
    if (actionChoice === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie eine Aktion aus.' }); }

    return true;
  }

  function validateMaxFutureDate(e) {
    const num = document.getElementById('max-days-field').value;
    if (Number.isNaN(num)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }
    if (num === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

    return true;
  }

  function validateMaxTime(e) {
    const numHours = document.getElementById('max-time-hours-field').value;
    if (numHours === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

    return true;
  }

  function validateOpeningHours(e) {
    const start = document.forms.OpeningHoursForm['opening-from'].value;
    const end = document.forms.OpeningHoursForm['opening-to'].value;

    const weekdays = document.querySelectorAll('input[name="weekdays"]:checked');
    if (weekdays.length === 0) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie mindestens einen Wochentag aus.' }); }
    if (end <= start || start === 0 || end === 0) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie eine g??ltige Start- und Endzeit aus.' }); }

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
    if (startTimestamp >= endTimestamp) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Start- und Endzeit an.' }); }

    rooms.forEach((room) => {
      if (room.checked) { roomChecked = true; }
    });

    if (!roomChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie einen Raum oder mehrere R??ume aus.' }); }

    return true;
  }

  function validateRestrictCategories(e) {
    const numHours = document.getElementById('max-time-hours-field').value;
    if (numHours === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine valide Anzahl an.' }); }

    return true;
  }

  function validateSavedRooms(e) {
    const savedRoomsAction = document.forms.saved_rooms.saved_rooms_action.value;
    if (savedRoomsAction === 'null') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie eine Aktion aus.' }); }
    if (savedRoomsAction === 'delete') {
      const isConfirmedDelete = !!confirm('Sind Sie sicher, dass Sie den ausgew??hlten Raum l??schen m??chten?');
      if (isConfirmedDelete) { return true; }

      e.preventDefault();
      return false;
    }

    const rooms = document.getElementsByName('selectedRoom');
    let roomValue = false;

    rooms.forEach((room) => {
      if (room.checked) { roomValue = true; }
    });

    if (!roomValue) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte w??hlen Sie einen Raum aus.' }); }

    return true;
  }

  const customElementsRegistry = window.customElements;
  customElementsRegistry.define('lmsr-toast', LmsrToast);
  customElementsRegistry.define(
    'lmsr-equipment-selection',
    LmsrEquipmentSelection,
  );
  customElementsRegistry.define('lmsr-edit-modal', LmsrEditModal);

  exports.closeModal = closeModal;
  exports.closeToast = closeToast;
  exports.deleteEquipmentConfirmation = deleteEquipmentConfirmation;
  exports.deleteRoomConfirmation = deleteRoomConfirmation;
  exports.editEquipmentValidation = editEquipmentValidation;
  exports.getBlackoutsBySelectedRoom = getBlackoutsBySelectedRoom;
  exports.getCheckedOptions = getCheckedOptions;
  exports.getColorTextWithContrast = getColorTextWithContrast;
  exports.getEquipmentBySelectedRoom = getEquipmentBySelectedRoom;
  exports.hydrateAvailabilitySearch = hydrateAvailabilitySearch;
  exports.hydrateRoomConfinement = hydrateRoomConfinement;
  exports.loadSelectedAction = loadSelectedAction;
  exports.notifyOnSubmitWithMessage = notifyOnSubmitWithMessage;
  exports.prohibitFormSubmitWithMessage = prohibitFormSubmitWithMessage;
  exports.renderCalendar = renderCalendar;
  exports.setBlackoutValueOnChange = setBlackoutValueOnChange;
  exports.validateAddEquipment = validateAddEquipment;
  exports.validateAddRooms = validateAddRooms;
  exports.validateAvailabilitySearchForBookas = validateAvailabilitySearchForBookas;
  exports.validateAvailabilitySearchForOPAC = validateAvailabilitySearchForOPAC;
  exports.validateAvailabilitySearchResultsForBookas = validateAvailabilitySearchResultsForBookas;
  exports.validateBookingAction = validateBookingAction;
  exports.validateConfigAction = validateConfigActions;
  exports.validateConfirmation = validateConfirmation;
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
