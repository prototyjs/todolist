export function runTimer(timerElement, durationInSeconds, resolve, reject) {

	const reset = () => {
		cancelAnimationFrame(timerElement._animationId)
		timerElement._animationId = null
		timerElement.classList.remove('countdown')
		timerElement.style.removeProperty('--progress')
	}

	if (timerElement._animationId) {
		reset()
		reject?.()
		return
	}

	timerElement.classList.add('countdown')
	const duration = durationInSeconds * 1000
	const start = performance.now()

	function update(now) {
		const timePassed = now - start
		if (timePassed >= duration) {
			reset()
			resolve?.()
			return
		}
		const progressRemaining = 100 - (timePassed / duration) * 100
		timerElement.style.setProperty('--progress', `${progressRemaining.toFixed(2)}%`)
		timerElement._animationId = requestAnimationFrame(update)
	}

	timerElement._animationId = requestAnimationFrame(update)
}
