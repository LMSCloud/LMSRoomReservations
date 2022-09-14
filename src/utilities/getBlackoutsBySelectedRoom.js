export default function getBlackoutsBySelectedRoom({ entryPoint, blackouts }) {
  const entryPointRef = document.getElementById(entryPoint);
  entryPointRef.innerHTML = '';
  let [selectedRoom] = document.getElementById('availability-search-room').selectedOptions;
  selectedRoom = selectedRoom.text.replace(/\(.*\)/, '').trim();
  const blackoutsForSelectedRoom = blackouts.reduce((accumulator, blackout) => {
    if (blackout.roomnumber === selectedRoom) { accumulator.push(blackout); }
    return accumulator;
  }, []);
  if (blackoutsForSelectedRoom.length === 0) {
    const blackoutInfo = document.createElement('span');
    blackoutInfo.classList.add('row', 'mx-1', 'p-1');
    blackoutInfo.textContent = 'Für diesen Raum existieren derzeit keine Sperrzeiten.';
    entryPointRef.appendChild(blackoutInfo);
    return;
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
}
