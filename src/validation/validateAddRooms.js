import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateAddRooms(e, rooms) {
  const roomname = document.forms.addRoomForm['add-room-roomnumber'].value;
  const maxcapacity = document.forms.addRoomForm['add-room-maxcapacity'].value;
  const equipment = document.getElementsByName('selected-equipment');

  if (rooms.some((room) => room.roomnumber === roomname)) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Diese Raumbezeichnung ist bereits vergeben.' }); }
  if (roomname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Raumbezeichnung an.' }); }
  if (maxcapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte geben Sie eine Maximalkapazität an.' }); }

  let equipmentChecked = false;
  equipment.forEach((item) => {
    if (item.checked) {
      equipmentChecked = true;
    }
  });

  if (!equipmentChecked) { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Bitte wählen Sie die Raumaustattung aus. Sollte der Raum über keine Austattung verfügen, wählen Sie \'nichts\' aus.' }); }

  return true;
}
