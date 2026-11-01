import { generateId } from './generateId.js'

export default class Service {
	constructor() {
		this.storageKey = 'rayDoCategories'
		this.data = this.load()
		this.categories = new Map()
		this.rebuildCategories()
		this.generateId = generateId
		this.maxFolder = 5
		this.maxCategory = 5
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
	addFolder(name) {
		if (this.data.length >= this.maxFolder) {
			throw new Error(`Maximum folder limit reached (${this.maxFolder})`)
		}

		const newFolder = {
			id: this.generateId(),
			title: name,
			categories: []
		}

		this.data.push(newFolder)
		this.save()
		return newFolder
	}
	addCategory(name, folderId) {
		const folder = this.data.find(f => f.id === folderId)
		if (!folder) {
			throw new Error(`Folder visual not found`)
		}

		if (folder.categories.length >= this.maxCategory) {
			throw new Error(`Maximum category limit reached (${this.maxCategory}) in this folder`)
		}

		const newCategory = {
			id: this.generateId(),
			title: name,
			count: !folder.categories.length ? 0 : 5 // for testing
		}

		folder.categories.push(newCategory)
		this.save()
		return newCategory
	}
	deleteFolder(folderId) {
		const index = this.data.findIndex(folder => folder.id === folderId)
		if (index === -1) {
			throw new Error(`Folder not found`)
		}
		if (index === 0) {
			throw new Error(`System folder`)
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
	getAll() {
		return this.data
	}
	getTitle(categoryId) {
		return this.categories.get(categoryId)?.title || 'unknown'
	}
}