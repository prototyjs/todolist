console.log('PWA is running');

// install check
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    console.log('beforeinstallprompt event fired');
});

window.addEventListener('appinstalled', () => {
    console.log('app installed');
});