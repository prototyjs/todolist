console.log('PWA is running');

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