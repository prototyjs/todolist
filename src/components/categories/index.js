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
			target: null,
			current: null,
			folders: data,
		},
		params: {
			limit: api.categories.limit
		},
		methods: {
			isCurrentRenaming(id) {
				return this.state.isRenaming && this.state.current?.id === id
			},
			isCurrent(id) {
				return this.state.current?.id && (this.state.current.id === id)
			},
			async rename() {
				this.state.isRenaming = true
				await nextTick()
				const input = this.root.querySelector('input.active')
				input.value = this.state.current.title
				input.focus()
				input.select()
			},
			remove() {
				if (this.state.current.categories?.length === 1) {
					const res = api.categories.deleteFolder(this.state.current.id)
					if (res.success) {
						const index = this.state.folders.findIndex(folder => folder.id === this.state.current.id)
						this.state.folders.splice(index, 1)
					}
					return
				}
				if (!this.state.current.categories && !this.state.current.count) {
					this.methods.removeCategory()
					return
				}
				this.state.target = this.state.current
				eventBus.emit('dialog:open', {
					type: 'deleteCategory',
					action: this.methods.removeCategory.bind(this),
					action2: this.methods.moveAndDelete.bind(this)
				})
			},
			moveAndDelete() {
				this.state.isDeleting = true
				this.state.isMoving = true
			},
			move() {
				this.state.target = this.state.current
				this.state.isMoving = true
			},
			renameCategory(item, event) {
				const name = event.target.value.trim()
				if (name.length) {
					const res = api.categories[item.categories ? 'renameFolder' : 'renameCategory'](item.id, name)
					res && (item.title = res.title)
				}
				this.state.current = null
				nextTick().then(_=> this.state.isRenaming = false)
			},
			removeCategory() {
				const id = this.state.target?.id || this.state.current.id
				api.categories.deleteCategory(id)
				data.forEach(folder => {
					if (!folder.categories) return
					const categoryIndex = folder.categories.findIndex(category => category.id === id)
					if (categoryIndex !== -1) {
						folder.categories.splice(categoryIndex, 1)
					}
				})
			},
			moveCategory() {
				const res = api.categories.mergeCategories(this.state.target.id, this.state.current.id)
				if (!res) {
					return
				}
				this.state.current.count = res.count
				this.state.target.count = 0
				this.state.isDeleting && this.methods.removeCategory()
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
			},
			emit
		},
		created() {
			this.root.innerHTML = template
		}
	})
}