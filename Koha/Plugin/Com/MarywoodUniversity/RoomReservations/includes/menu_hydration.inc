<script>
  document.addEventListener('DOMContentLoaded', () => {
    const configActionsForm = document.querySelector('form[name="config_actions"]');
    const actionsMenu = document.querySelectorAll('.lmsr-menu-list-item');
    const actionsInput = document.querySelector('input[name="op"]');
    const actionsSubmit = document.querySelector('input[name="config-actions-submit"]');

    configActionsForm.addEventListener('submit', (e) => {
      const actionsInput = document.querySelector('input[name="op"]');
      if (actionsInput === '') { e.preventDefault(); return false; }
    });

    actionsMenu.forEach((action) => {
      action.addEventListener('click', (e) => {
        actionsInput.setAttribute('value', `${e.target.dataset.value}`);
        actionsSubmit.click();
      });
    });
  });

  if (window.history.replaceState) {
    window.history.replaceState(null, null, window.location.href);
  }
</script>