class ScreenSlider {
	constructor(container, mainIndex = 2) {
		this.container = container
		this.screens = Array.from(this.container.children)
		this.mainIndex = mainIndex
		this.currentIndex = mainIndex
		this.isAnimating = false
		this._handleTransitionEnd = this._handleTransitionEnd.bind(this)
		this._init()
	}
	_init() {
		this.screens.forEach((screen, index) => {
			if (index === this.currentIndex) {
				screen.hidden = false
				screen.classList.add('is-active')
			} else {
				screen.hidden = true
			}
		})
	}
	goTo(targetIndex) {
		if (this.isAnimating || targetIndex === this.currentIndex) return
		if (targetIndex < 0 || targetIndex >= this.screens.length) return

		this.isAnimating = true

		const currentScreen = this.screens[this.currentIndex]
		const targetScreen = this.screens[targetIndex]
		const isMovingForward = targetIndex > this.currentIndex

		const prepareClass = isMovingForward ? 'prepare-right' : 'prepare-left'
		targetScreen.classList.add(prepareClass)
		targetScreen.hidden = false

		targetScreen.offsetHeight

		targetScreen.addEventListener('transitionend', this._handleTransitionEnd)

		this._transitionContext = { currentScreen, targetScreen, targetIndex, isMovingForward }

		targetScreen.classList.remove(prepareClass)
		targetScreen.classList.add('is-active')

		const moveClass = isMovingForward ? 'move-to-left' : 'move-to-right'
		currentScreen.classList.remove('is-active')
		currentScreen.classList.add(moveClass)
	}
	_handleTransitionEnd(event) {

		if (event.propertyName !== 'transform') return

		const { currentScreen, targetScreen, targetIndex, isMovingForward, prepareClass } = this._transitionContext

		targetScreen.removeEventListener('transitionend', this._handleTransitionEnd)

		const moveClass = isMovingForward ? 'move-to-left' : 'move-to-right'
		currentScreen.classList.remove(moveClass);
		currentScreen.hidden = true

		this.currentIndex = targetIndex
		this.isAnimating = false
		this._transitionContext = null
	}
	goToMain() {
		this.goTo(this.mainIndex)
	}
}

export function createScreenSlider(...arg) {
	return new ScreenSlider(...arg)
}