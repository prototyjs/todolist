import { prototy } from '@/prototy.js'
import card from './components/card.html?raw'
import { createScreenSlider } from './components/screens'
import { createDropDown } from './components/dropdown'
import { createCalendar } from './components/calendar'
import { createCategories } from './components/categories'
import { runTimer } from './utils/runTimer'
import './utils/eventBus.js'
import ui from './ui'
import tasks from './mock/tasks.js'
import './components/screens/index.css'
import './components/settings/index.css'
import './components/categories/index.css'
import './components/sheet/index.css'
import './components/dialog/index.css'
import './styles/switch.css'

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
		screens: null,
		ui,
		lastActiveCard: null,
		taskPin: tasks[3],
		taskPlay: tasks[4]
	},
	state: {
		searchShow: false,
		filters: {
			status: ui.defaultStatus,
			folder: 'Any folder', // Main
			isRemoved: true,
			isCompleted: false,
		},
		countdownName: '',
		tasks,
		dialog: {
			text: '',
			input: '',
			actionName: '',
			action: () => {},
			actionName2: '',
			action2: () => {},
		}
	},
	setters: {
		'filters.status'(v) {
			if (v === 'Removed') {
				this.state.filters.isRemoved = true
			}
			return v
		}
	},
	computed: {},
	methods: {
		icon(item) {
			const icons = {
				keep: 'lock',
				pin: 'pin',
				playing: 'play',
				completed: 'checked',
				spotlight: 'spotlight'
			}
			return icons[Object.keys(icons).find(key => item[key])]
		},
		dialogOpen(type, action) {

		},
		viewTask() {
			this.params.screens.goTo(3)
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
						if (!el.parentElement.classList.contains('removing')) {
							//el.parentElement.scrollLeft = el.parentElement.clientWidth
						}
					}
				},
				actionsRight: {
					onclick({ el }) {
						if (!el.parentElement.classList.contains('removing')) {
							//el.parentElement.scrollLeft = 0
						}
					}
				},
				removeBtn: {
					onclick({ el, props }) {
						console.log(props)
						this.state.countdownName = 'remove'
						this.state.tasks[6].removed = true
						runTimer(el, 3, () => {
							this.state.countdownName = ''
						},() => {
							this.state.tasks[6].removed = false
							this.state.countdownName = ''
						})
					}
				},
				skipBtn: {
					onclick({ el }) {
						this.state.tasks[7].skipped = true
						this.state.countdownName = 'skip'
						runTimer(el, 3, () => {
							this.state.countdownName = ''
						},() => {
							this.state.tasks[7].skipped = false
							this.state.countdownName = ''
						})
					}
				}
			}
		}
	},
	ready() {
		this.params.screens = createScreenSlider(this.els.screens)
		const { statuses, folders } = ui.filters
		createDropDown({
			element: this.els.statuses,
			current: this.state.filters.status,
			id: statuses.id,
			items: statuses.items,
			actions: statuses.actions,
			onchange: (v) => this.state.filters.status = v,
			emit: (v) => {
				if (v === 'Clear Removed') {
					window.eventBus.emit('dialog:open', { type: 'Clear Removed', action: () => {} })
				}
			}
		})
		createDropDown({
			element: this.els.folders,
			current: this.state.filters.folder,
			id: folders.id,
			items:[...folders.items, { icon: 'folder', text: 'My Folder' }], // если попок больше одной Any Folder
			actions: folders.actions,
			// onchange: (v) => this.state.filters.status = v
			emit: (v) => {
				if (v === 'Configure') {
					this.params.screens.goTo(1)
				}
			}
		})
		createCalendar({
			element: this.els.sheetContent,
			// onchange,
			// emit = () => {}
		})
		createCategories({
			element: this.els.categoriesSection,
			onclose: () => this.params.screens.goToMain()
			// onchange,
		})
		const unsub = window.eventBus.on('dialog:open', ({ type, action, action2, element = dialogElement }) => {
			this.state.dialog.text = ui.dialog[type].text
			this.state.dialog.actionName = ui.dialog[type].actionName
			this.state.dialog.action = () => {
				action(this.state.dialog.input)
				this.state.dialog.input = ''
				element.close()
			}
			if (action2) {
				this.state.dialog.actionName2 = ui.dialog[type].actionName2
				this.state.dialog.action2 = () => {
					action2()
					element.close()
				}
			}
			element.showModal()
		})
	}
})