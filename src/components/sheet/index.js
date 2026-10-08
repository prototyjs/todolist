const sheet = document.getElementById('universal-sheet');
const container = document.querySelector('.bottom-sheet-container');
const dragHandle = document.querySelector('.bottom-sheet-drag-handle');
const slot = document.getElementById('sheet-slot');

let startY = 0;
let currentY = 0;
let isDragging = false;

// ... функции openSheet и closeSheet остаются прежними ...

// Включаем отслеживание пальца при нажатии на ручку
dragHandle.addEventListener('touchstart', (e) => {
	startY = e.touches[0].clientY;
	isDragging = true;
	// Убираем плавную анимацию на время перетаскивания, чтобы шторка шла ровно за пальцем
	sheet.style.transition = 'none';
});

dragHandle.addEventListener('touchmove', (e) => {
	if (!isDragging) return;

	currentY = e.touches[0].clientY;
	const deltaY = currentY - startY;

	// Если тянем вниз, сдвигаем шторку вслед за пальцем
	if (deltaY > 0) {
		sheet.style.transform = `translateY(${deltaY}px)`;
	}
});

dragHandle.addEventListener('touchend', (e) => {
	if (!isDragging) return;
	isDragging = false;

	// Возвращаем CSS-анимацию назад
	sheet.style.transition = 'transform 0.3s cubic-bezier(0.25, 0.8, 0.25, 1)';

	const deltaY = currentY - startY;

	// Если протащили вниз больше чем на 100 пикселей — закрываем шторку
	if (deltaY > 100) {
		closeSheet();
	} else {
		// Если потянули чуть-чуть и отпустили — возвращаем на место
		sheet.style.transform = 'translateY(0)';
	}

	// Сбрасываем координаты
	startY = 0;
	currentY = 0;
});

// Когда шторка полностью закрывается, сбрасываем её положение для следующего открытия
sheet.addEventListener('toggle', (event) => {
	if (event.newState === 'closed') {
		document.body.style.overflow = '';
		sheet.style.transform = ''; // сброс transform
		setTimeout(() => { slot.innerHTML = ''; }, 300);
	}
});