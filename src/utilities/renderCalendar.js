import getColorTextWithContrast from './getColorTextWithContrast';

export default function renderCalendar() {
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
