export default function prohibitFormSubmitWithMessage({
  e,
  type,
  message,
  style = [
    { key: 'bottom', value: '3.5em' },
    { key: 'right', value: '1em' },
  ],
}) {
  e.preventDefault();
  const lmsrNotifications = document.getElementById('lmsr-notifications');
  lmsrNotifications.innerHTML = '';
  const lmsrToast = document.createElement('lmsr-toast', { is: 'lmsr-toast' });
  lmsrToast.innerHTML = `
      <strong slot="title">${type}</strong>
      <p slot="message">${message}</p>
      ${style ? `<style>${style}</style>` : ''}
    `;
  const lmsrToastDiv = lmsrToast.shadowRoot.querySelector('.lmsr-toast');
  if (style) {
    style.forEach((directive) => {
      const { key, value } = directive;
      lmsrToastDiv.style[key] = value;
    });
  }
  lmsrNotifications.appendChild(lmsrToast);

  return false;
}
