import { prototy } from '@/prototy.js'
import card from './components/card.html?raw'
import { createDropDown } from './components/dropdown'
import { createCalendar } from './components/calendar'
import ui from './ui'
import tasks from './mock/tasks.js'
import './components/sheet/index.css'

const animationBtn = {
	onanimationend: ({ el }) => el.classList.remove('smooth'),
	onclick: ({ el }) => {
		el.classList.remove('smooth')
		el.classList.add('smooth')
	}
}

const app = prototy({
	root: document.body,
	params: {
		ui,
		lastActiveCard: null,
		taskPin: tasks[3],
		taskPlay: tasks[tasks.length - 1],
	},
	state: {
		searchShow: false,
		filters: {
			status: ui.defaultStatus,
			folder: 'Any folder', // Main
			isRemoved: true,
			isCompleted: false
		},
		tasks
	},
	setters: {
		'filters.status'(v) {
			if (v === 'Removed') {
				this.state.filters.isRemoved = true
			}
			return v
		}
	},
	methods: {
		icon(item) {
			const _item ={
				...item,
				playing: item === this.params.taskPin,
			}
			const icons = {
				removed: 'remove',
				pin: 'pin',
				playing: 'play',
				completed: 'checked',
				spotlight: 'spotlight'
			}
			return icons[Object.keys(icons).find(key => _item[key])]
		}
	},
	elements: {
		categories: {
			'onscroll.passive'() {
				this.els.folders.classList.add('hide')
			},
			'onscrollend'() {
				this.els.folders.classList.remove('hide')
			}
		},
		searchBtn: {
			onclick({ el }) {
				this.state.searchShow = !this.state.searchShow
			}
		}
	},
	components: {
		card: {
			template: card,
			elements: {
				wrapper: {
					el({ el }) {
						const [cardLeft, cardCenter, cardRight] = el.children
						const { params } = this

						el.scrollLeft = cardCenter.offsetLeft - (el.clientWidth - cardCenter.clientWidth) / 2
						el.classList.add('is-ready')

						el.addEventListener('scrollsnapchange', ({ snapTargetInline: activeCard }) => {
							// console.log(params.lastActiveCard)
							if (activeCard !== cardCenter && params.lastActiveCard !== el) {
								if (params.lastActiveCard) {
									const pos = params.lastActiveCard.getAttribute('position')

									if (pos === 'right') params.lastActiveCard.scrollLeft = 0
									if (pos === 'left') params.lastActiveCard.scrollLeft = el.parentElement.clientWidth

								}
								params.lastActiveCard = el
							}

							let position = 'center'

							if (activeCard === cardLeft) position = 'left'
							if (activeCard === cardRight) position = 'right'

							el.setAttribute('position', position)

							cardLeft.style.display = position === 'right' ? 'none' : 'flex'
							cardRight.style.display = position === 'left' ? 'none' : 'flex'

						})
					}
				},
				actionsLeft: {
					onclick({ el }) {
						el.parentElement.scrollLeft = el.parentElement.clientWidth
					}
				},
				actionsRight: {
					onclick({ el }) {
						el.parentElement.scrollLeft = 0
					}
				}
			}
		}
	},
	ready() {
		const { statuses, folders } = ui.filters
		createDropDown({
			element: this.els.statuses,
			current: this.state.filters.status,
			id: statuses.id,
			items: statuses.items,
			actions: statuses.actions,
			onchange: (v) => this.state.filters.status = v
		})
		createDropDown({
			element: this.els.folders,
			current: this.state.filters.folder,
			id: folders.id,
			items:[...folders.items, { icon: 'folder', text: 'My Folder' }], // если попок больше одной Any Folder
			actions: folders.actions,
			// onchange: (v) => this.state.filters.status = v
		})
		// createCalendar({
		// 	element: this.els.sheetContent,
		// 	// onchange,
		// 	// emit = () => {}
		// })
	}
})