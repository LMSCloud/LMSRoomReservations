export default function getCheckedOptions({ elements, hiddenInputReference }) {
  const hiddenInput = document.getElementById(hiddenInputReference);
  const options = document.querySelectorAll(elements);
  options.forEach((option) => {
    option.addEventListener('change', () => {
      const checkedOptions = Array.from(options).reduce((accumulator, _option) => {
        if (_option.checked) { accumulator.push(_option.value); } return accumulator;
      }, []);
      hiddenInput.value = checkedOptions;
    });
  });
}
