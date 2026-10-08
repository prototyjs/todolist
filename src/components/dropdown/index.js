import { prototy } from '@/prototy.js'
import './index.css'
import template from './index.html?raw'

export function createDropDown({ element, current, id, items, actions, onchange, emit = () => {} }) {
	const app = prototy({
		root: element,
		state: {
			currentIndex: items.findIndex((item) => item.text === current),
		},
		params: { id, items, actions },
		methods: {
			active(index) {
				this.state.currentIndex = index
				onchange?.(items[index].text)
			},
			emit
		},
		created() {
			this.root.innerHTML = template
		}
	})
}