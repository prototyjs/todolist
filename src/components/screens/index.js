class ScreenSlider {
	constructor({ container, mainIndex = 0, autoHeight }) {
		this.container = container
		this.autoHeight = autoHeight
		this.screens = Array.from(this.container.children)
		this.mainIndex = mainIndex
		this.currentIndex = mainIndex
		this.isAnimating = false
		this._handleTransitionEnd = this._handleTransitionEnd.bind(this)
		this._init()
	}
	_init() {
		if (this.autoHeight) {
			this.container.classList.add('is-auto-height')
		}
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

		if (this.autoHeight) {
			this.container.parentNode.style.height = targetScreen.offsetHeight + 'px'
		} else {
			targetScreen.offsetHeight
		}


		targetScreen.addEventListener('transitionend', this._handleTransitionEnd)

		this._transitionContext = { currentScreen, targetScreen, targetIndex, isMovingForward }

		targetScreen.classList.remove(prepareClass)
		targetScreen.classList.add('is-active')

		const moveClass = isMovingForward ? 'move-to-left' : 'move-to-right'
		currentScreen.classList.remove('is-active')
		currentScreen.classList.add(moveClass)
	}
	_handleTransitionEnd(event) {
		const expectedProperty = this.autoHeight ? 'opacity' : 'transform'
		if (event.propertyName !== expectedProperty) return

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