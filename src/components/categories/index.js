import { prototy, nextTick } from '@/prototy.js'
import { api } from '../../utils/api.js'
import { UI_MATRIX } from './uiMatrix.js'
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
			current: null,
			target: null,
			isMoving: false,
			isDeleting: false,
			isRenaming: false,
			folders: data,
		},
		params: {
			limit: api.categories.limit,
			input: { target: null }
		},
		methods: {
			getUI(item, prop) {
				if (!item) return null

				const type = ('categories' in item) ? 'folder' : 'category'
				const id = item.id
				let state = 'IDLE'

				if (type === 'folder') {
					if (id === 'inbox') state = 'INBOX'
					else if (!id) state = 'NEW'
					else if (this.state.current === item && this.state.isRenaming) state = 'RENAMING'
				}
				else if (type === 'category') {
					if (id === 'general') state = 'GENERAL'
					else if (!id) state = 'NEW'
					else if (this.state.current === item && this.state.isRenaming) state = 'RENAMING'
				}

				return UI_MATRIX[type][state]?.[prop] ?? null
			},
			actionIcon(item) {
				if (item.id !== this.state.target?.id) {
					return (this.state.isDeleting || this.state.isMoving) ? 'checked_line' : null
				}
				return this.state.isDeleting ? 'remove' : null
			},
			isCurrent(id) {
				if (!id) return false
				return this.state.current?.id === id
			},
			async rename() {
				this.state.isRenaming = true
				await nextTick()
				const input = this.params.input.target
				input.value = this.state.current.title
				input.focus()
				input.select()
			},
			remove() {
				const current = this.state.current
				if (!current) return
				if (current.categories?.length === 1) {
					const res = api.categories.deleteFolder(current.id)
					if (res.success) {
						const index = this.state.folders.findIndex(folder => folder.id === current.id)
						this.state.folders.splice(index, 1)
					}
					this.state.current = null
					return
				}
				if (!current.categories && !current.count) {
					this.methods.removeCategory()
					return
				}
				this.state.target = current
				eventBus.emit('dialog:open', {
					type: 'deleteCategory',
					action: this.methods.removeCategory.bind(this),
					action2: this.methods.moveAndDelete.bind(this),
					cancel: () => {
						this.state.target = null
					}
				})
			},
			moveAndDelete() {
				this.state.isDeleting = true
				this.state.isMoving = true
				this.state.current = null
			},
			move() {
				this.state.target = this.state.current
				this.state.isMoving = true
				this.state.current = null
			},
			renameCategory(item, event) {
				const name = event.target.value.trim()
				if (name.length) {
					const res = api.categories[item.categories ? 'renameFolder' : 'renameCategory'](item.id, name)
					res && (item.title = res.title)
				}
				this.state.current = null
				nextTick().then(() => this.state.isRenaming = false)
			},
			removeCategory() {
				const itemToRemove = this.state.target || this.state.current;
				if (!itemToRemove) return
				const res = api.categories.deleteCategory(itemToRemove.id)
				if (res.success) {
					data.forEach(folder => {
						if (!folder.categories) return
						const categoryIndex = folder.categories.findIndex(category => category.id === itemToRemove.id)
						if (categoryIndex !== -1) {
							folder.categories.splice(categoryIndex, 1)
						}
					})
				}
				this.state.target = null
				this.state.current = null
			},
			moveCategory() {
				const current = this.state.current
				const target = this.state.target

				if (!current || !target) return

				const res = api.categories.mergeCategories(target.id, current.id)
				if (!res) {
					return
				}
				current.count = res.count
				target.count = 0
				if (this.state.isDeleting) {
					this.methods.removeCategory()
				}
				this.state.isMoving = false
				this.state.isDeleting = false
				this.state.target = null
				this.state.current = null
			},
			addCategory(name, folder) {
				console.log(name, folder)
				const category = api.categories.addCategory(name, folder.id)
				folder.categories.splice(folder.categories.length - 1, 0, category)
			},
			addFolder(name) {
				console.log(name)
				const folder = api.categories.addFolder(name)
				folder.categories.push({ icon: 'plus', title: 'Add new category', role: 'addCategory' })
				this.state.folders.splice(this.state.folders.length - 1, 0, folder)
			},
			handleMenu(event, type, item, folder) {
				if (this.state.isRenaming) {
					return
				}
				if (item.role) {
					this.state.current = null
					eventBus.emit('dialog:open', { type: item.role, action: (name) => this.methods[item.role](name, folder), element: dialogField })
					return
				}
				if (this.state.current?.id === item.id) {
					this.state.current = null
					return
				}
				if (this.state.isMoving && type === 'folder') {
					return
				}
				this.state.current = item
			},
			close() {
				onclose()
			},
			cancel() {
				this.state.current = this.state.target
				this.state.isMoving = false
				this.state.isDeleting = false
				this.state.target = null
			},
			emit
		},
		created() {
			this.root.innerHTML = template
		}
	})
}