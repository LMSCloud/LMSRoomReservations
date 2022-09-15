export default function getEquipmentBySelectedRoom({
  rooms,
  equipment,
  entryPoint,
}) {
  const showEquipmentHint = (entryPointRef) => {
    const equipmentInfo = document.createElement('span');
    equipmentInfo.classList.add('row', 'mx-1', 'p-1');
    equipmentInfo.textContent = 'Für diesen Raum konnte kein Equipment gefunden werden.';
    entryPointRef.appendChild(equipmentInfo);
    return false;
  };

  const lmsrEquipmentSelection = document.getElementById(
    'lmsr-equipment-selection',
  );
  lmsrEquipmentSelection.innerHTML = '';
  const [selectedRoom] = document.getElementById(
    'availability-search-room',
  ).selectedOptions;
  if (!+selectedRoom.value) {
    return showEquipmentHint(lmsrEquipmentSelection);
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
    entryPoint.appendChild(
      lmsrEquipmentSelectionCheckForm,
    );
  });

  return true;
}
