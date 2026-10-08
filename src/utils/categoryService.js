class Service {
	constructor({ deleteTasksByCategoryId }) {
		this.storageKey = 'rayDoCategories'
		this.categories = this.load()
		this.categoriesMap = new Map()
		this.categories.forEach(category => this.categoriesMap.set(category.id, category))
		this.maxFolder = 5
		this.maxCategory = 5
		this.deleteTasksByCategoryId = deleteTasksByCategoryId
	}
	load() {
		try {
			const data = localStorage.getItem(this.storageKey)
			if (data) {
				return JSON.parse(data)
			} else {
				const categories = []
				for (let i = 0; i < this.maxFolder; i++) {
					const folder = { id: '_' + i, title: '', order: 0, categories: [] }
					for (let j = 0; j < this.maxCategory; j++) {
						folder.categories.push({ id: '_' + i + j, title: '', order: 0 })
					}
					categories.push(folder)
				}
				categories[0].title = 'Main'
				categories[0].order = -1
				categories[0].categories[0].title = 'Inbox'
				categories[0].categories[0].order = -1
				return categories
			}
		} catch (error) {
			console.error('Error loading categories:', error)
			return []
		}
	}
	save() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.categories))
		} catch (error) {
			console.error('Error saving:', error)
		}
	}
	deleteFolder(folderId, title) {
		const index = this.categories.findIndex(item => item.id === folderId)
		if (index === -1) {
			throw new Error(`Folder "${title}" not found`)
		}
		if (index === 0) {
			throw new Error(`${title} is system folder`)
		}
		if (title !== this.categories[index].title) {
			return { error: true }
		}
		const folder = this.categories[index]
		folder.categories.forEach((category) => this.deleteTasksByCategoryId(category.id))
		folder.title = ''
		folder.order = 0
		folder.categories = []
		this.save()
		return { success: true }
	}
	deleteCategory(categoryId, title) {
		const category = this.categoriesMap.get(categoryId)
		if (!category) {
			throw new Error(`Category "${title}" not found`)
		}
		if (category.id === '_00') {
			throw new Error(`"${title}" is system category`)
		}
		if (title !== category.title) {
			return { error: true, data: { title } }
		}
		category.title = ''
		category.order = 0
		this.save()
		return { success: true }
	}
	getAll() {
		return this.categories
	}
	getTitle(categoryId) {
		return this.categoriesMap.get(categoryId)?.title || 'unknown'
	}
}