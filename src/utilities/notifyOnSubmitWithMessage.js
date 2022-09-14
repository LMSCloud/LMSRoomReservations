export default function notifyOnSubmitWithMessage({ type, message, style = null }) {
  const lmsrNotifications = document.getElementById('lmsr-notifications');
  lmsrNotifications.innerHTML = '';
  const lmsrToast = document.createElement('lmsr-toast', { is: 'lmsr-toast' });
  lmsrToast.innerHTML = `
      <strong slot="title">${type}</strong>
      <p slot="message">${message}</p>
    `;
  const lmsrToastDiv = lmsrToast.shadowRoot.querySelector('.lmsr-toast');
  if (style) {
    style.forEach((directive) => {
      const { key, value } = directive;
      lmsrToastDiv.style[key] = value;
    });
  }

  lmsrNotifications.appendChild(lmsrToast);
}
