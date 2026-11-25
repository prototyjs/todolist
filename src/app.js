import { prototy, nextTick } from '@/prototy.js'
import card from './components/card.html?raw'
import timepicker from './components/timepicker/index.html?raw'
import { createScreenSlider } from './components/screens'
import { createDropDown } from './components/dropdown'
import { createCalendar } from './components/calendar'
import { createCategories } from './components/categories'
import { createTask } from './components/task'
import { runTimer } from './utils/runTimer'
import { createTimepicker } from './components/timepicker'
import './utils/eventBus.js'
import ui from './ui'
import tasks from './mock/tasks.js'
import './components/screens/index.css'
import './components/settings/index.css'
import './components/categories/index.css'
import './components/sheet/index.css'
import './components/dialog/index.css'
import './components/timepicker/index.css'
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
		ui,
		lastActiveCard: null,
		taskPin: tasks[3],
		taskPlay: tasks[4],
		timepicker: {},
	},
	state: {
		loaded: false,
		searchShow: false,
		filters: {
			status: ui.defaultStatus,
			folder: 'Any folder', // Main
			isRemoved: true,
			isCompleted: false,
		},
		task: {
			date: '',
			notifications: { h: '05', m: '00', default: { h: '09', m: '01' }, used: true },
			duration: { h: '00', m: '40', used: false },
			repeats: 'Never',
		},
		countdownName: '',
		tasks,
		toast: {
			text: 'Update raydo',
			type: 'info', // warning, error
			action: () => {},
		},
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
		},
		'task.*'(v,_,setterKey) {
			console.log(setterKey)
			nextTick().then(() => eventBus.emit('update:task', { data: this.state.task }))
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
		dialogClear() {
			this.els.dialogInput.value = ''
			dialogField.close()
		},
		updateNoticeDefault() {
			const { h, m } = this.state.task.notifications
			this.state.task.notifications.default = { h, m }
		},
		uniteTime({ h, m }) {
			return h + ':' + m
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
		timepicker,
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
	created() {
		createTimepicker.bind(this)()
	},
	ready() {
		console.log(this.els)
		const screens = createScreenSlider({ container: this.els.screens, mainIndex: 2 })
		const articles = createScreenSlider({ container: this.els.articles, autoHeight: true })

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
					eventBus.emit('dialog:open', { type: 'Clear Removed', action: () => {} })
				}
			}
		})
		createDropDown({
			element: this.els.folders,
			current: this.state.filters.folder,
			id: folders.id,
			items:[...folders.items, { icon: 'folder', text: 'My Folder' }], // если папок больше одной Any Folder
			actions: folders.actions,
			// onchange: (v) => this.state.filters.status = v
		})
		createCalendar(this.els.sheetCalendar)
		createCategories(this.els.categoriesSection)
		createTask(this.els.taskSection)

		eventBus.on('calendar:select', (v) => {
			console.log(v)
			this.state.task.date = v
		})

		eventBus.on('navigation:main', () => screens.goToMain()) // const unsub =
		eventBus.on('navigation:task', () => screens.goTo(3))
		eventBus.on('navigation:category', () => screens.goTo(1))
		eventBus.on('navigation:settings', () => screens.goTo(0))

		eventBus.on('popover:task', () => {
			this.els.sheet.showPopover()
			articles.goTo(0)
			eventBus.emit('calendar:set')
		})

		eventBus.on('popover:notifications', () => {
			articles.goTo(1)
			this.params.timepicker.set(this.els.notifications.els, this.state.task.notifications)
		})
		eventBus.on('popover:duration', () => {
			articles.goTo(2)
			this.params.timepicker.set(this.els.duration.els, this.state.task.duration)
		})
		eventBus.on('popover:repeats', () => articles.goTo(3))

		eventBus.on('dialog:open', ({ type, action, action2, cancel, element = dialogElement }) => {
			this.state.dialog.text = ui.dialog[type].text
			this.state.dialog.actionName = ui.dialog[type].actionName
			this.state.dialog.action = () => {
				action(this.state.dialog.input)
				this.state.dialog.input = ''
				element.close()
			}
			this.state.dialog.cancel = () => {
				this.state.dialog.input = ''
				cancel?.()
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
		this.state.loaded = true
	}
})