export default function hydrateRoomConfinement() {
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
