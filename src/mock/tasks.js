export default [
	{ title: 'Buy groceries for the week', category: 'Shopping', completed: false, removed: true, spotlight: false, pin: false, keep: true },
	{ title: 'Prepare Q3 sales report', category: 'Work', completed: true, removed: true, spotlight: true, pin: false },
	{ title: 'Call mom regarding weekend plans', category: 'Personal', completed: false, removed: false, spotlight: true, pin: false },
	{ title: 'Fix the leaking bathroom faucet', category: 'Home', completed: false, removed: false, spotlight: false, pin: true },
	{ title: 'Complete JavaScript Arrays lesson', category: 'Education', completed: false, removed: false, spotlight: false, pin: false, playing: true  },
	{ title: 'Book an appointment with the dentist', category: 'Health', completed: true, removed: false, spotlight: false, pin: false },
	{ title: 'Water the indoor plants', category: 'Home', completed: false, removed: false, spotlight: true, pin: false },
	{ title: 'Old outdated checklist item', category: 'Health', id: 1, completed: false, removed: false, spotlight: true,  pin: false, repeatable: true, frequency: 'daily', is_active: true, skipped: false } // 'daily', 'weekly', 'monthly'
]