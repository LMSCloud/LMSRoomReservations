import LMSModal from './LMSModal';

export default class LMSEquipmentModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.fields = [
      { name: 'equipmentid', type: 'text' },
      { name: 'equipmentname', type: 'text', desc: 'Equipmentname' },
    ];
    this.createOpts = {
      endpoint: '/api/v1/contrib/roomreservations/equipment',
      method: 'POST',
    };
  }
}

customElements.define('lms-equipment-modal', LMSEquipmentModal);
