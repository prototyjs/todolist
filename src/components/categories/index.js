import { prototy, nextTick } from '@/prototy.js'
import './index.css'
import template from './index.html?raw'

export function createCategories({ element, onclose, emit = () => {} }) {
	const app = prototy({
		root: element,
		state: {
			isMoving: false,
			isRenaming: false,
			isDeleting: false,
			targetCategory: null,
			activeId: null,
			activeItem: null,
			folders: [{
				id: 'inbox',
				icon: 'inbox',
				text: 'Inbox',
				categories: [{ id: 'general', icon: 'general', text: 'General', count: 33 }, { id: '11', text: 'Банананы', count: 0 }, { icon: 'plus', text: 'Add new category' }],
			},{
				id: '2',
				text: 'Овощи',
				categories: [{ id: '21', text: 'Томаты', count: 15 }, { id: '22', text: 'Огурцы', count: 2 }, { icon: 'plus', text: 'Add new category' }],
			},
			{ icon: 'plus', text: 'Add new folder' }],
		},
		params: {},
		methods: {
			isCurrentRenaming(id) {
				return this.state.isRenaming && this.state.activeItem?.id === id
			},
			isCurrent(id) {
				return this.state.activeItem?.id && (this.state.activeItem.id === id)
			},
			async rename() {
				this.state.isRenaming = true
				await nextTick()
				const input = this.root.querySelector('input.active')
				input.value = this.state.activeItem.text
				input.focus()
				input.select()
			},
			async save(item, event) {
				// event.preventDefault()
				const v = event.target.value.trim()
				if (v.length) {
					item.text = event.target.value.trim()
				}
				this.state.activeItem = null
				await nextTick()
				this.state.isRenaming = false
			},
			remove() {
				this.state.targetCategory = this.state.activeItem
				eventBus.emit('dialog:open', { type: 'deleteCategory', action: this.methods.deleteEmpty.bind(this), action2: this.methods.moveAndDelete.bind(this) })
			},
			moveAndDelete() {
				this.state.isDeleting = true
				console.log(this.state.activeItem, this.state.targetCategory)
				this.state.isMoving = true
			},
			deleteEmpty() {
				console.log('deleteEmpty')
			},
			close() {
				onclose()
			},
			cancel() {
				this.state.activeItem = this.state.targetCategory
				this.state.isMoving = false
				this.state.isDeleting = false
			},
			move() {
				this.state.targetCategory = this.state.activeItem
				this.state.isMoving = true
			},
			handleMenu(event, type, item) {
				if (this.state.isRenaming) {
					return
				}
				if (this.state.activeItem?.id === item.id) {
					this.state.activeItem = null
					return
				}
				if (this.state.isMoving && type === 'folder') {
					return
				}
				this.state.activeItem = item
			},
			emit
		},
		created() {
			this.root.innerHTML = template
		}
	})
}