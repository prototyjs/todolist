const labelsRow = document.querySelector('.labels-row');

let isMouseDown = false;
let startX;
let scrollLeft;

labelsRow.addEventListener('mousedown', (e) => {
  isMouseDown = true;
  startX = e.pageX - labelsRow.offsetLeft;
  scrollLeft = labelsRow.scrollLeft;
});

labelsRow.addEventListener('mouseleave', () => {
  isMouseDown = false;
});

labelsRow.addEventListener('mouseup', () => {
  isMouseDown = false;
});

labelsRow.addEventListener('mousemove', (e) => {
  if (!isMouseDown) return;

  e.preventDefault();
  const x = e.pageX - labelsRow.offsetLeft;
  const walk = (x - startX) * 1.5;
  labelsRow.scrollLeft = scrollLeft - walk;
});