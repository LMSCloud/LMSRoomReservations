export default function closeModal({ selector }) {
  const lmsrModal = document.querySelector(selector);
  const lmsrModalRoot = lmsrModal.shadowRoot;
  const lmsrModalButtonClose = lmsrModalRoot.querySelector('.lmsr-modal-button-close');
  lmsrModalButtonClose.addEventListener('click', () => { lmsrModal.remove(); });
  lmsrModalButtonClose.disabled = false;
}
