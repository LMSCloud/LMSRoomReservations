import prohibitFormSubmitWithMessage from '../utilities/prohibitFormSubmitWithMessage';

export default function validateEditRoomsRoom(e) {
  const roomname = document.forms.editRoomDetails['edit-rooms-room-roomnumber'].value;
  const maxcapacity = document.forms.editRoomDetails['edit-rooms-room-maxcapacity'].value;
  if (roomname === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Raumbezeichnung darf nicht leer sein.' }); }
  if (maxcapacity === '') { return prohibitFormSubmitWithMessage({ e, type: 'Warnung', message: 'Die Maximalkapazität darf nicht leer sein.' }); }

  return true;
}
