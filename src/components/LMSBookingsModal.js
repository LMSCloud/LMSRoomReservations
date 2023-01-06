import LMSModal from './LMSModal';

export default class LMSBookingsModal extends LMSModal {
  static get properties() {
    return { fields: { type: Array } };
  }

  constructor() {
    super();
    this.fields = [
      { name: 'borrowernumber', type: 'number', desc: 'Borrowernumber' },
      { name: 'roomid', type: 'number', desc: 'Roomid' },
      { name: 'start', type: 'datetime-local', desc: 'Starts at' },
      { name: 'end', type: 'datetime-local', desc: 'Ends at' },
      { name: 'blackedout', type: 'integer', desc: 'Is blackout' },
    ];
    this.createOpts = {
      endpoint: '/api/v1/contrib/roomreservations/bookings',
      method: 'POST',
    };
  }
}

customElements.define('lms-bookings-modal', LMSBookingsModal);