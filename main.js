console.log('PWA is running');

// Service Worker check
if ('serviceWorker' in navigator) {
				navigator.serviceWorker.register('/sw.js')
					.then(registration => {
						console.log('Service Worker registered with scope:', registration.scope);
					})
					.catch(error => {
						console.log('Service Worker registration failed:', error);
					})
			}

// install check
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    console.log('beforeinstallprompt event fired');
});

window.addEventListener('appinstalled', () => {
    console.log('app installed');
});