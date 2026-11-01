import { prototy, nextTick } from '@/prototy.js'
import { api } from '../../utils/api.js'
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
				categories: [{ id: 'general', text: 'General', count: 33 }, { id: '11', text: 'Банананы', count: 0 }, { text: 'Add new category', role: 'addCategory' }],
			},{
				id: '2',
				text: 'Овощи',
				categories: [{ id: '21', text: 'Томаты', count: 15 }, { id: '22', text: 'Огурцы', count: 2 }, { text: 'Add new category', role: 'addCategory' }],
			},
			{ text: 'Add new folder', role: 'addFolder' }],
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
			addCategory(name, folder) {
				console.log(name, folder)
				// id = api.categories.add(folder, name)
				const id = api.category.generateId()
				folder.categories.splice(folder.categories.length - 1, 0, { id, text: name, count: 0 })
			},
			addFolder(name) {
				console.log(name)
				const id = api.category.generateId()
				this.state.folders.splice(this.state.folders.length - 1, 0, { id, text: name, categories: [{ icon: 'plus', text: 'Add new category', role: 'addCategory' }] })
			},
			handleMenu(event, type, item, folder) {
				if (item.role) {
					this.state.activeItem = null
					eventBus.emit('dialog:open', { type: item.role, action: (name) => this.methods[item.role](name, folder), element: dialogField })
					return
				}
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