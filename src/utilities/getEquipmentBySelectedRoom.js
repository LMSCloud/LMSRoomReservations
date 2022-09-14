export default function getEquipmentBySelectedRoom({
  rooms,
  equipment,
  lmsrEquipmentSelectionEntryPoint,
}) {
  const lmsrEquipmentSelection = document.getElementById(
    'lmsr-equipment-selection',
  );
  lmsrEquipmentSelection.innerHTML = '';
  const [selectedRoom] = document.getElementById(
    'availability-search-room',
  ).selectedOptions;
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
    lmsrEquipmentSelectionEntryPoint.appendChild(
      lmsrEquipmentSelectionCheckForm,
    );
  });
}
