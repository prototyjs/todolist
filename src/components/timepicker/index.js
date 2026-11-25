export function createTimepicker() {
	const pad = (n) => String(n).padStart(2, '0')
	this.params.timepicker = {
		hours: Array.from({ length: 24 * 3 }, (_, i) => pad(i % 24)),
		minutes: Array.from({ length: 60 * 3 }, (_, i) => pad(i % 60)),
		change: (time, type, event) => {
			if (!event.snapTargetBlock) return
			time[type] = event.snapTargetBlock.textContent
			console.log(time)
		},
		scroll(container) {
			const loopHeight = container.children[container.children.length / 3].getBoundingClientRect().top -
				container.children[0].getBoundingClientRect().top

			const { scrollTop } = container
			if (scrollTop >= loopHeight * 0.5 && scrollTop < loopHeight * 1.5) return

			container.style.scrollSnapType = 'none'
			container.scrollTop += scrollTop < loopHeight * 0.5 ? loopHeight : -loopHeight
			requestAnimationFrame(() => container.style.scrollSnapType = 'y mandatory')
		},
		set(element, { h, m }) {
			const set = (el, val) => {
				const target = el.children[el.children.length / 3 + Number(val)]
				el.scrollTop = target.offsetTop - target.clientHeight
			}
			set(element.hours, h)
			set(element.minutes, m)
		}
	}
}