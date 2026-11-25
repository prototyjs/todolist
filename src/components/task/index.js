import { prototy } from '@/prototy.js'
import { api } from '../../utils/api.js'
import './index.css'
import template from './index.html?raw'

export async function createTask(element) {
	// const task = api.task.getCurrent()
	const app = prototy({
		root: element,
		state: {
			task: {
				notifications: {},
				duration: {},
				repeats: ''
			},
			hasChanges: false
		},
		params: {
			maxlengthName: 35
		},
		computed: {
			category() {
				return api.categories.getTitle(this.state.task.categoryId || 'general')
			},
			date() {
				return `${this.state.task.date || 'No Date'} ${this.state.task.notifications?.time || ''} ${this.state.task.repeats || ''}`
			}
		},
		methods: {
			close() {
				eventBus.emit('navigation:main')
			}
		},
		created() {
			eventBus.on('navigation:task', (v) => {
				if (v?.data) {
					this.state.task = v.data

				}
			})
			eventBus.on('update:task', (v) => {
				if (v?.data) {
					if (v.data.date) {
						this.state.task.date = new Date(v.data.date).toLocaleDateString('ru-RU')
						this.state.task.notifications.time = v.data.notifications.h + ':' + v.data.notifications.m
						this.state.task.duration.time = v.data.duration.h + ':' + v.data.duration.m
						this.state.task.repeats = v.data.repeats === 'Never' ? '' : v.data.repeats
					} else {
						this.state.task.date = ''
						this.state.task.notifications.time = ''
						this.state.task.duration.time = ''
						this.state.task.repeats = ''
					}
				}
			})

			this.root.innerHTML = template
		}
	})
}