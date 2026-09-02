import { createScreens } from './utils/screenManager.js'

const screens = createScreens()

screens.active('task')

function centerTasks() {
    console.log('>>> ФУНКЦИЯ ЦЕНТРИРОВАНИЯ ЗАПУЩЕНА <<<');
    const wrappers = document.querySelectorAll('.task-swipe-wrapper');

    wrappers.forEach(wrapper => {
        const leftActions = wrapper.querySelector('.task-actions-left');
        if (leftActions) {
            wrapper.style.scrollBehavior = 'auto';
            wrapper.scrollLeft = leftActions.offsetWidth;
            requestAnimationFrame(() => {
                wrapper.style.scrollBehavior = 'smooth';
            });
        }
    });
}

centerTasks();

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then(registration => {
        registration.update();
    });

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('Service Worker activated...');
        window.location.reload();
    });
}
// install check
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    console.log('beforeinstallprompt event fired');
});

window.addEventListener('appinstalled', () => {
    console.log('app installed');
});