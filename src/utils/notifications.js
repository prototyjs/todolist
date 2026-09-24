// const PERMISSION_KEY = 'notifications-permission-asked'

// function isSupported() {
//     return 'Notification' in window && 'serviceWorker' in navigator
// }

// async function getRegistration() {
//     return navigator.serviceWorker.ready
// }

// export function setupAutoPermission(onGranted) {
//     if (!isSupported()) return

//     if (localStorage.getItem(PERMISSION_KEY)) return

//     if (Notification.permission !== 'default') {
//         localStorage.setItem(PERMISSION_KEY, 'true')
//         return
//     }

//     const askOnce = async () => {
//         document.removeEventListener('click', askOnce, true)
//         document.removeEventListener('touchstart', askOnce, true)
//         localStorage.setItem(PERMISSION_KEY, 'true')

//         try {
//             const permission = await Notification.requestPermission()
//             console.log('[Notifications] Permission:', permission)

//             if (permission === 'granted') {
//                 await showWelcome()
//                 if (typeof onGranted === 'function') onGranted()
//             }
//         } catch (e) {
//             console.warn('[Notifications] Bad requiest:', e)
//         }
//     }

//     document.addEventListener('click', askOnce, { capture: true, once: true })
//     document.addEventListener('touchstart', askOnce, { capture: true, once: true })
// }

// export async function notify(title, options = {}) {
//     if (!isSupported()) {
//         console.log('[Notifications] not supported')
//         return
//     }

//     if (Notification.permission !== 'granted') {
//         console.log('[Notifications] not allow')
//         return
//     }

//     const reg = await getRegistration()
//     await reg.showNotification(title, {
//         ...options,
//     })
// }

class Notifications {
  static PERMISSION_KEY = "notifications-permission-asked"

  constructor(options = {}) {
    this.icon = options.icon
    this.sound = options.sound
    this.tag = options.tag
    this.renotify = options.renotify
  }

  async #getRegistration() {
    return navigator.serviceWorker.ready
  }

  setupAutoPermission(onGranted) {
    if (!Notifications.isSupported()) return

    if (localStorage.getItem(Notifications.PERMISSION_KEY)) return

    if (Notification.permission !== "default") {
      localStorage.setItem(Notifications.PERMISSION_KEY, "true")
      return
    }

    const askOnce = async () => {
      document.removeEventListener("click", askOnce, true)
      document.removeEventListener("touchstart", askOnce, true)

      localStorage.setItem(Notifications.PERMISSION_KEY, "true")

      try {
        const permission = await Notification.requestPermission()
        console.log("[Notifications] Permission:", permission)

        if (permission === "granted" && typeof onGranted === "function") {
          onGranted()
        }
      } catch (e) {
        console.warn("[Notifications] Bad request:", e)
      }
    }

    document.addEventListener("click", askOnce, { capture: true, once: true })
    document.addEventListener("touchstart", askOnce, {
      capture: true,
      once: true,
    })
  }

  static isSupported() {
    return "Notification" in window && "serviceWorker" in navigator
  }

  async show(title, options = {}) {
    if (!Notifications.isSupported()) {
      console.log("[Notifications] not supported")
      return
    }

    if (Notification.permission !== "granted") {
      console.log("[Notifications] not allow")
      return
    }
    const reg = await this.#getRegistration()
    await reg.showNotification(title, {
      icon: this.icon,
      ...options,
    })
  }
}

export { Notifications }
