import { prototy, nextTick } from '@/prototy.js'
import { api } from '../../utils/api.js'
import './index.css'
import template from './index.html?raw'

export async function createCategories({ element, onclose, emit = () => {} }) {
	const data = api.categories.getAll()
	for (const folder of data) {
		folder.categories.push({ title: 'Add new category', role: 'addCategory' })
	}
	data.push({ title: 'Add new folder', role: 'addFolder' })
	const app = prototy({
		root: element,
		state: {
			isMoving: false,
			isRenaming: false,
			isDeleting: false,
			targetCategory: null,
			activeId: null,
			activeItem: null,
			folders: data,
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
				input.value = this.state.activeItem.title
				input.focus()
				input.select()
			},
			async save(item, event) {
				// event.preventDefault()
				const v = event.target.value.trim()
				if (v.length) {
					item.title = event.target.value.trim()
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
				this.state.isMoving = true
			},
			deleteEmpty() {
				console.log('deleteEmpty')
				const id = this.state.targetCategory?.id || this.state.activeItem.id
				api.categories.deleteCategory(id)
				data.forEach(folder => {
					if (!folder.categories) return
					const categoryIndex = folder.categories.findIndex(category => category.id === id)
					if (categoryIndex !== -1) {
						folder.categories.splice(categoryIndex, 1)
					}
				})
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
				// move tasks
				this.state.isDeleting && this.methods.deleteEmpty()
				this.state.isMoving = false
				this.state.isDeleting = false
				this.state.targetCategory = null
				this.state.activeItem = null
			},
			addCategory(name, folder) {
				console.log(name, folder)
				const category = api.categories.addCategory(name, folder.id)
				console.log(category)
				folder.categories.splice(folder.categories.length - 1, 0, category)
			},
			addFolder(name) {
				console.log(name)
				const folder = api.categories.addFolder(name)
				folder.categories.push({ icon: 'plus', title: 'Add new category', role: 'addCategory' })
				this.state.folders.splice(this.state.folders.length - 1, 0, folder)
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