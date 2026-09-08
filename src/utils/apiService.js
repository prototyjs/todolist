class ApiService {
	constructor(storageKey = 'rayDoDB') {
		this.storageKey = storageKey
		this.todos = this.load()
	}
	load() {
		try {
			const data = localStorage.getItem(this.storageKey)
			return data ? JSON.parse(data) : []
		} catch (error) {
			console.error('Error loading todos:', error)
			return []
		}
	}
	generateId() {
		const array = new Uint8Array(8)
		crypto.getRandomValues(array)
		return Array.from(array, byte => byte.toString(36).padStart(2, '0')).join('')
	}
	save() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.todos))
		} catch (error) {
			console.error('Error saving todos:', error)
		}
	}
	add({ title, description = '', category, period }) {
		if (!title || title.trim() === '') {
			throw new Error('Title is required')
		}
		const newTodo = {
			id: this.generateId(),
			title: title.trim(),
			description: description.trim(),
			category,
			period,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString(),
			completed: false,
			removed: false
		}
		this.todos.push(newTodo)
		this.save()
		return newTodo
	}
	delete(id) {
		const index = this.todos.findIndex(todo => todo.id === id);
		if (index === -1) {
			throw new Error(`Todo with id ${id} not found`)
		}
		const deleted = this.todos.splice(index, 1)[0]
		this.save()
		return deleted
	}
	update(item) {
		const { id } = item
		const todo = this.todos.find(t => t.id === id)
		if (!todo) {
			throw new Error(`Todo with id ${id} not found`)
		}
		if (item.title !== undefined) {
			todo.title = item.title.trim()
		}
		if (item.description !== undefined) {
			todo.description = item.description.trim()
		}
		if (item.category !== undefined) {
			todo.category = item.category.trim()
		}
		if (item.period !== undefined) {
			todo.period = item.period.trim()
		}
		if (item.completed !== undefined) {
			todo.completed = Boolean(item.completed)
		}
		if (item.removed !== undefined) {
			todo.removed = Boolean(item.removed)
		}
		todo.updatedAt = new Date().toISOString()
		this.save()
		return todo
	}
	search(query) {
		if (!query || query.trim() === '') {
			return this.getAll()
		}
		const searchTerm = query.trim().toLowerCase()
		return this.todos.filter(todo =>
			todo.title.toLowerCase().includes(searchTerm) ||
			todo.description.toLowerCase().includes(searchTerm)
		)
	}
	getAll() {
		return [...this.todos]
	}
	getByStatus(completed) {
		return this.todos.filter(todo => todo.completed === Boolean(completed))
	}
	getByCategory(category) {
		return this.todos.filter(todo => todo.category === category)
	}
	getByPeriod(period) {

	}
}