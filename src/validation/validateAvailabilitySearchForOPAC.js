import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateAvailabilitySearchForOPAC({ e, rooms }) {
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
      message: `Die angegebene Zeitspanne überschreitet den Maximalwert: ${timeString}.`,
      style: [
        { key: 'bottom', value: '1em' },
        { key: 'right', value: '1em' },
      ],
    });
  }

  searchFormArray.forEach((entry) => {
    const [, values] = entry;
    if (values.value === '') {
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
