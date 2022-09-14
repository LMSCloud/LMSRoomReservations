export default function closeToast() {
  const lmsrToast = document.querySelector('lmsr-toast');
  const lmsrToastRoot = lmsrToast.shadowRoot;
  const lmsrToastButtonClose = lmsrToastRoot.querySelector('.lmsr-toast-button-close');
  lmsrToastButtonClose.addEventListener('click', () => { lmsrToast.remove(); });
  lmsrToastButtonClose.disabled = false;
  window.setTimeout(() => { lmsrToast.remove(); }, 3000);
}
