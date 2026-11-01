class Service {
	constructor() {
		this.storageKey = 'rayDoDB'
		this.pinsKey = 'rayDoPin'
		this.todos = this.load(this.storageKey)
		this.pins = this.load(this.pinsKey)
		this.maxPins = 1
	}
	load(key) {
		try {
			const data = localStorage.getItem(key)
			return data ? JSON.parse(data) : []
		} catch (error) {
 			console.error('Error loading:', error)
			return []
		}
	}

	save() {
		try {
			localStorage.setItem(this.storageKey, JSON.stringify(this.todos))
		} catch (error) {
			console.error('Error saving todos:', error)
		}
	}
	pin(id) {
		const index = this.pins.findIndex(item => item === id)
		if (index === -1) {
			if (this.pins.length === this.maxPins) {
				this.pins[0] = id
			} else {
				this.pins.unshift(id)
			}
		} else {
			this.pins.splice(index, 1)
		}
		localStorage.setItem(this.pinsKey, JSON.stringify(this.pins))
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
			removed: false,
			spotlight: false,
			todoDate: null, // const now = new Date().toISOString();
			notification: {
				todoTime: null,
				triggerAt: '2026-09-25T10:30:00.000Z',
				//  'daily', 'weekly', 'monthly'
				repeatInterval: null
			}
		}
		this.todos.push(newTodo)
		this.save()
		return newTodo
	}
	handleRepeating(todo) {
		const currentTrigger = new Date(todo.notification.triggerAt);

		if (todo.notification.repeatInterval === 'daily') {
			currentTrigger.setDate(currentTrigger.getDate() + 1);
			todo.notification.triggerAt = currentTrigger.toISOString();
		} else if (todo.notification.repeatInterval === 'weekly') {
			currentTrigger.setDate(currentTrigger.getDate() + 7);
			todo.notification.triggerAt = currentTrigger.toISOString();
		} else {

			todo.notification.triggerAt = null;
		}
		return todo;
	}
	delete(id) {
		const index = this.todos.findIndex(item => item.id === id)
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

		['title', 'description', 'category', 'period', 'completed', 'removed'].forEach((key) => {
			if (item[key] !== undefined) {
				todo[key] = (typeof todo[key] === 'boolean') ?  Boolean(item[key]) : item[key].trim()
			}
		})

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