import { html, LitElement } from 'lit';
import LMSRoom from './components/LMSRoom';
import LMSModal from './components/LMSModal';
import LMSRoomModal from './components/LMSRoomModal';
import LMSEquipmentItem from './components/LMSEquipmentItem';
import LMSEquipmentModal from './components/LMSEquipmentModal';
import LMSSearch from './components/LMSSearch';
import LMSTable from './components/LMSTable';
import LMSSettingsTable from './components/LMSSettingsTable';
import LMSOpenHoursTable from './components/LMSOpenHoursTable';
import LMSBookingsTable from './components/LMSBookingsTable';
import LMSBookingsModal from './components/LMSBookingsModal';

function renderOnUpdate({
  entryPoint,
  tagname,
  eventName,
  eventTarget,
  endpoint,
  options = {},
}) {
  const entryPointRef = entryPoint;
  const eventTargetRef = eventTarget || entryPoint;
  eventTargetRef.addEventListener(eventName, async () => {
    const response = await fetch(endpoint, options);
    if ([200, 201].includes(response.status)) {
      const result = await response.json();
      entryPointRef.innerHTML = '';
      result.forEach((item) => {
        const element = document.createElement(tagname);
        Object.keys(item).forEach((key) => {
          element.setAttribute(key, item[key]);
        });
        entryPointRef.appendChild(element);
      });
    }
  });
}


export {
  html,
  LitElement,
  LMSRoom,
  LMSModal,
  LMSRoomModal,
  LMSEquipmentItem,
  LMSEquipmentModal,
  LMSSearch,
  LMSTable,
  LMSSettingsTable,
  LMSOpenHoursTable,
  LMSBookingsTable,
  LMSBookingsModal,
  renderOnUpdate,
};
