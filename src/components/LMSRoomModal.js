import LMSModal from './LMSModal';

export default class LMSRoomModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.fields = [
      { name: 'maxcapacity', type: 'text', desc: 'Max capacity' },
      { name: 'color', type: 'color', desc: 'Color' },
      { name: 'image', type: 'text', desc: 'Image' },
      { name: 'description', type: 'text', desc: 'description' },
      { name: 'maxbookabletime', type: 'text', desc: 'Max bookable time' },
      { name: 'roomid', type: 'text' },
      { name: 'branch', type: 'text', desc: 'Branch' },
      { name: 'roomnumber', type: 'text', desc: 'Roomnumber' },
    ];
    this.createOpts = {
      endpoint: '/api/v1/contrib/roomreservations/rooms',
      method: 'POST',
    };
  }
}

customElements.define('lms-room-modal', LMSRoomModal);
