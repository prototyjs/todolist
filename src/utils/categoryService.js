import { generateId } from './generateId.js'

export default class Service {
	constructor() {
		this.storageKey = 'rayDoCategories'
		this.data = this.load()
		this.categories = new Map()
		this.rebuildCategories()
		this.generateId = generateId
		this.limit = 5
	}
	rebuildCategories() {
		this.categories.clear()
		this.data.forEach(folder =>
			folder.categories.forEach(category => this.categories.set(category.id, category))
		)
	}
	load() {
		const sample = [{ id: 'inbox', title: 'Inbox', categories: [{ id: 'general', title: 'General', count: 0 }] }]
		try {
			const data = localStorage.getItem(this.storageKey)
			if (data) {
				return JSON.parse(data)
			} else {
				return sample
			}
		} catch (error) {
			console.error('Error loading categories:', error)
			return sample
		}
	}
	save() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.data))
			this.rebuildCategories()
		} catch (error) {
			console.error('Error saving:', error)
		}
	}
	renameFolder(folderId, name) {
		if (folderId === 'inbox') {
			throw new Error(`System folder`)
		}
		const folder = this.data.find(f => f.id === folderId)
		if (!folder) {
			throw new Error(`Folder not found`)
		}
		folder.title = name
		this.save()
		return folder
	}
	renameCategory(categoryId, name) {
		if (categoryId === 'general') {
			throw new Error(`System category`)
		}
		const category = this.categories.get(categoryId)
		if (!category) {
			throw new Error(`Category not found`)
		}
		category.title = name
		this.save()
		return category
	}
	mergeCategories(fromCategoryId, toCategoryId) {
		const fromCategory = this.categories.get(fromCategoryId)
		const toCategory = this.categories.get(toCategoryId)
		if (!fromCategory || !toCategoryId) {
			throw new Error(`Category not found`)
		}
		toCategory.count += fromCategory.count
		fromCategory.count = 0
		// taskApi
		this.save()
		return toCategory
	}
	addFolder(name) {
		if (this.data.length >= this.limit) {
			throw new Error(`Maximum folder limit reached (${this.limit})`)
		}

		const newFolder = {
			id: this.generateId(),
			title: name,
			categories: []
		}

		this.data.push(newFolder)
		this.save()
		return JSON.parse(JSON.stringify(newFolder))
	}
	addCategory(name, folderId) {
		const folder = this.data.find(f => f.id === folderId)
		if (!folder) {
			throw new Error(`Folder visual not found`)
		}

		if (folder.categories.length >= this.limit) {
			throw new Error(`Maximum category limit reached (${this.limit}) in this folder`)
		}

		const newCategory = {
			id: this.generateId(),
			title: name,
			count: !folder.categories.length ? 0 : 5 // for testing
		}

		folder.categories.push(newCategory)
		this.save()
		return JSON.parse(JSON.stringify(newCategory))
	}
	deleteFolder(folderId) {
		const index = this.data.findIndex(folder => folder.id === folderId)
		if (index === -1) {
			throw new Error(`Folder not found`)
		}
		if (index === 0) {
			throw new Error(`System folder`)
		}
		if (this.data[index].categories.length > 0) {
			throw new Error(`Cannot delete folder: it contains categories`)
		}
		this.data.splice(index, 1)
		this.save()
		return { success: true }
	}
	deleteCategory(categoryId) {
		const category = this.categories.get(categoryId)
		if (!category) {
			throw new Error(`Category not found`)
		}
		if (category.id === 'general') {
			throw new Error(`System category`)
		}
		for (const folder of this.data) {
			const cIndex = folder.categories.findIndex(c => c.id === categoryId)
			if (cIndex !== -1) {
				folder.categories.splice(cIndex, 1)
				break
			}
		}
		this.save()
		return { success: true }
	}
	incrementCategoryCount(categoryId, value = 1) {
		const category = this.categories.get(categoryId)
		if (!category) {
			throw new Error(`Category not found`)
		}
		category.count += value
		this.save()
		return category
	}
	decrementCategoryCount(categoryId, value = 1) {
		const category = this.categories.get(categoryId)
		if (!category) {
			throw new Error(`Category not found`)
		}
		category.count = Math.max(0, category.count - value)
		this.save()
		return category
	}
	getAll() {
		return JSON.parse(JSON.stringify(this.data))
	}
	getTitle(categoryId) {
		return this.categories.get(categoryId)?.title || 'unknown'
	}
}