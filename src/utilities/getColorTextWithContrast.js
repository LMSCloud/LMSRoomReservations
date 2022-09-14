export default function getColorTextWithContrast(color) {
  let red = 0;
  let green = 0;
  let blue = 0;

  if (!color) {
    // Generate random RGB values
    red = Math.floor(Math.random() * 256 - 1);
    green = Math.floor(Math.random() * 256 - 1);
    blue = Math.floor(Math.random() * 256 - 1);
  }

  if (color) {
    [red, green, blue] = color.replace(
      /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
      (m, r, g, b) => `#${r}${r}${g}${g}${b}${b}`,
    )
      .substring(1).match(/.{2}/g)
      .map((x) => parseInt(x, 16));
  }

  // Calculate brightness of randomized colour
  const brightness = (red * 299 + green * 587 + blue * 114) / 1000;

  // Calculate brightness of white and black text
  const lightText = (255 * 299 + 255 * 587 + 255 * 114) / 1000;
  const darkText = (0 * 299 + 0 * 587 + 0 * 114) / 1000;

  const backgroundColor = `rgb(${red},${green},${blue})`;
  const textColor = Math.abs(brightness - lightText) > Math.abs(brightness - darkText)
    ? 'rgb(255, 255, 255)'
    : 'rgb(0, 0, 0)';

  return [backgroundColor, textColor];
}
