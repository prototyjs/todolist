class EventBus {
	constructor() {
		this.listeners = {}
	}
	/**
	 * @param {string} event
	 * @param {Function} callback
	 * @returns {Function}
	 */
	on(event, callback) {
		if (!this.listeners[event]) {
			this.listeners[event] = []
		}
		this.listeners[event].push(callback)
		return () => this.off(event, callback)
	}
	/**
	 * @param {string} event
	 * @param {Function} callback
	 */
	off(event, callback) {
		if (!this.listeners[event]) return
		this.listeners[event] = this.listeners[event].filter(cb => cb !== callback)
	}
	/**
	 * @param {string} event
	 * @param {Object} payload
	 */
	emit(event, payload = {}) {
		if (!this.listeners[event]) return

		this.listeners[event].forEach(callback => {
			try {
				callback(payload)
			} catch (error) {
				console.error(`Error in event handler '${event}':`, error)
			}
		})
	}
}
window.eventBus = new EventBus()

// const unsub = window.eventBus.on('cart:add-item', ({ product }) => {})
// window.eventBus.emit('cart:add-item', { product })
// unsub()