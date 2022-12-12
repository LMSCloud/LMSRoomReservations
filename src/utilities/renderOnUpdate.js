export default function renderOnUpdate({
  entryPoint,
  tagname,
  eventName,
  eventTarget,
  endpoint,
  options = {},
}) {
  const entryPointRef = entryPoint;
  const eventTargetRef = eventTarget || entryPoint;
  eventTargetRef.addEventListener(eventName, async () => {
    const response = await fetch(endpoint, options);
    if ([200, 201].includes(response.status)) {
      const result = await response.json();
      entryPointRef.innerHTML = '';
      result.forEach((item) => {
        const element = document.createElement(tagname);
        Object.keys(item).forEach((key) => {
          element.setAttribute(key, item[key]);
        });
        entryPointRef.appendChild(element);
      });
    }
  });
}
