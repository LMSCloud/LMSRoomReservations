import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateBookingAction({
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
      message: 'Bitte wählen Sie eine Aktion aus.',
    });
  }
  if (action === '') {
    return prohibitFormSubmitWithMessage({
      e,
      type: 'Warnung',
      message: 'Bitte wählen Sie eine Aktion aus.',
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
      <input type="submit" name="submit-edit-booking" id="submit-edit-booking" value="Bestätigen" />
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
