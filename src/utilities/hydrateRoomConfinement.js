export default function hydrateRoomConfinement() {
  const roomConfinementItems = document.querySelectorAll(
    '.lmsr-calendar-room-confinement-item',
  );
  const bookings = document.querySelectorAll('.lmsr-calendar-data-booking');

  const resetVisibility = (e) => {
    roomConfinementItems.forEach((roomConfinementItem) => {
      if (
        roomConfinementItem.textContent.trim() !== e.target.textContent.trim()
      ) {
        const ref = roomConfinementItem;
        ref.dataset.active = 'false';
      }
    });
    bookings.forEach((booking) => {
      const ref = booking;
      ref.style.display = 'block';
    });
  };

  const toggleVisibility = (e) => {
    resetVisibility(e);
    const state = e.target.dataset.active === 'true';
    e.target.dataset.active = !state;
    bookings.forEach((booking) => {
      const ref = booking;
      if (
        !(
          booking.firstElementChild.textContent.trim()
          === e.target.textContent.trim()
        )
      ) {
        ref.style.display = state ? 'block' : 'none';
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
      toggleVisibility(e);
    });
  });
}
