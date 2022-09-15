import LmsrToast from './components/LmsrToast';
import LmsrEquipmentSelection from './components/LmsrEquipmentSelection';
import LmsrEditModal from './components/LmsrEditModal';

import closeModal from './utilities/closeModal';
import closeToast from './utilities/closeToast';
import getBlackoutsBySelectedRoom from './utilities/getBlackoutsBySelectedRoom';
import getCheckedOptions from './utilities/getCheckedOptions';
import getColorTextWithContrast from './utilities/getColorTextWithContrast';
import getEquipmentBySelectedRoom from './utilities/getEquipmentBySelectedRoom';
import hydrateAvailabilitySearch from './utilities/hydrateAvailabilitySearch';
import hydrateRoomConfinement from './utilities/hydrateRoomConfinement';
import loadSelectedAction from './utilities/loadSelectedAction';
import notifyOnSubmitWithMessage from './utilities/notifyOnSubmitWithMessage';
import prohibitFormSubmitWithMessage from './utilities/prohibitFormSubmitWithMessage';
import renderCalendar from './utilities/renderCalendar';
import setBlackoutValueOnChange from './utilities/setBlackoutValueOnChange';

import deleteEquipmentConfirmation from './validation/deleteEquipmentConfirmation';
import deleteRoomConfirmation from './validation/deleteRoomConfirmation';
import editEquipmentValidation from './validation/editEquipmentValidation';
import validateAddEquipment from './validation/validateAddEquipment';
import validateAddRooms from './validation/validateAddRooms';
import validateAvailabilitySearchForBookas from './validation/validateAvailabilitySearchForBookas';
import validateAvailabilitySearchForOPAC from './validation/validateAvailabilitySearchForOPAC';
import validateAvailabilitySearchResultsForBookas from './validation/validateAvailabilitySearchResultsForBookas';
import validateBookingAction from './validation/validateBookingAction';
import validateConfigAction from './validation/validateConfigAction';
import validateConfirmation from './validation/validateConfirmation';
import validateDate from './validation/validateDate';
import validateDisplayRooms from './validation/validateDisplayRooms';
import validateEditRooms from './validation/validateEditRooms';
import validateEditRoomsEquipment from './validation/validateEditRoomsEquipment';
import validateEditRoomsRoom from './validation/validateEditRoomsRoom';
import validateFullBlackout from './validation/validateFullBlackout';
import validateLimitRestriction from './validation/validateLimitRestriction';
import validateManageBlackouts from './validation/validateManageBlackouts';
import validateMaxFutureDate from './validation/validateMaxFutureDate';
import validateMaxTime from './validation/validateMaxTime';
import validateOpeningHours from './validation/validateOpeningHours';
import validatePartialBlackout from './validation/validatePartialBlackout';
import validateRestrictCategories from './validation/validateRestrictCategories';
import validateSavedRooms from './validation/validateSavedRooms';

const customElementsRegistry = window.customElements;
customElementsRegistry.define('lmsr-toast', LmsrToast);
customElementsRegistry.define(
  'lmsr-equipment-selection',
  LmsrEquipmentSelection,
);
customElementsRegistry.define('lmsr-edit-modal', LmsrEditModal);

export {
  closeModal,
  closeToast,
  getBlackoutsBySelectedRoom,
  getCheckedOptions,
  getColorTextWithContrast,
  getEquipmentBySelectedRoom,
  hydrateAvailabilitySearch,
  hydrateRoomConfinement,
  loadSelectedAction,
  notifyOnSubmitWithMessage,
  prohibitFormSubmitWithMessage,
  renderCalendar,
  setBlackoutValueOnChange,
  deleteEquipmentConfirmation,
  deleteRoomConfirmation,
  editEquipmentValidation,
  validateAddEquipment,
  validateAddRooms,
  validateAvailabilitySearchForBookas,
  validateAvailabilitySearchForOPAC,
  validateAvailabilitySearchResultsForBookas,
  validateBookingAction,
  validateConfigAction,
  validateConfirmation,
  validateDate,
  validateDisplayRooms,
  validateEditRooms,
  validateEditRoomsEquipment,
  validateEditRoomsRoom,
  validateFullBlackout,
  validateLimitRestriction,
  validateManageBlackouts,
  validateMaxFutureDate,
  validateMaxTime,
  validateOpeningHours,
  validatePartialBlackout,
  validateRestrictCategories,
  validateSavedRooms,
};
