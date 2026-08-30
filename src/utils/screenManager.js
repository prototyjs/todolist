class screenManager {
	constructor(options = {}) {
		this.selector = options.selector || 'section'
		this.element = options.element || document.body
		this.screenElements = this.element.querySelectorAll(options.selector)
		this.screens = {}
		this.activeScreen = {}
		Array.from(this.screenElements).forEach(screen => {
			const name = screen.getAttribute('name')
			this.screens[name] = screen
		})
	}
	active(name) {
		this.activeScreen.classList.remove('active')
		this.activeScreen = this.screens[name]
		this.activeScreen.classList.add('active')
	}
}

function createScreens(options) {
	return new screenManager(options)
}

export { createScreens }