import { prototy } from '@/prototy.js'
import template from './index.html?raw'
import './index.css'

const today = new Date()
const currentYear = today.getFullYear()
const START_YEAR = currentYear - 1
const END_YEAR = currentYear + 1

const monthFormat = new Intl.DateTimeFormat('en-En', { month: 'long' })
const weekdayFormat = new Intl.DateTimeFormat('en-En', { weekday: 'short' })

export function createCalendar({ element, onchange, emit = () => {} }) {
	const app = prototy({
		root: element,
		state: { selectedDate: 0 },
		params: {
			weekdays: (() => {
				const base = new Date(1970, 0, 5)
				return Array.from({length: 7}, (_, i) => {
					const d = new Date(base)
					d.setDate(base.getDate() + i)
					const name = weekdayFormat.format(d)
					return name.charAt(0).toUpperCase() + name.slice(1)
				})
			})(),
			monthsData: (() => {
				const list = []
				for (let y = START_YEAR; y <= END_YEAR; y++) {
					for (let m = 0; m < 12; m++) {
						const date = new Date(y, m, 1)
						const rawName = monthFormat.format(date)
						const totalDays = new Date(y, m + 1, 0).getDate()
						const offset = date.getDay() === 0 ? 6 : date.getDay() - 1
						const cells = []
						for (let i = 0; i < offset; i++) {
							cells.push({value: ''})
						}
						for (let d = 1; d <= totalDays; d++) {
							cells.push({value: d})
						}
						list.push({
							id: `${y}-${m}`,
							year: y,
							monthIndex: m,
							title: `${rawName.charAt(0).toUpperCase() + rawName.slice(1)} ${y}`,
							cells: cells
						})
					}
				}
				return list
			})(),
		},
		methods: {
			isToday: (y, m, d) => y === today.getFullYear() && m === today.getMonth() && d === today.getDate(),
			isSelected(y, m, d) {
				const s = this.state.selectedDate
				return s && y === s.getFullYear() && m === s.getMonth() && d === s.getDate()
			},
			selectDate(y, m, d) {
				this.state.selectedDate = new Date(y, m, d)
			}
		},
		created() {
			this.root.innerHTML = template
		},
		ready() {
			const w = this.els.viewport.clientWidth
			const currentMonthIndex = (today.getFullYear() - START_YEAR) * 12 + today.getMonth()
			this.els.viewport.scrollTo({left: w * currentMonthIndex, behavior: 'instant'})
		}
	})
}