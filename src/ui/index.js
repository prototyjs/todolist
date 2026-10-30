export default {
	defaultStatus: 'Incomplete',
	defaultFolder: 'Incomplete',
	mainFolder: 'Inbox',
	mainCategory: 'General',
	filters: {
		statuses: {
			id: 'params',
			items: [
				{ icon: 'status', text: 'Any spaces' },
				{ icon: 'checked', text: 'Completed' },
				{ icon: 'checked-line', text: 'Incomplete' }, // Default
				{ icon: 'spotlight', text: 'Spotlighted' }, // Only Completed
				{ icon: 'repeats', text: 'Repeats' }, // Only Completed
				{ icon: 'remove', text: 'Removed' }
			],
			actions: [
				{ icon: 'clear', text: 'Clear Removed', dangerous: true, for: 'Removed' },
				{ icon: 'clear', text: 'Clear Completed', for: 'Completed' }
			]
		},
		folders: {
			id: 'folders',
			items: [{ icon: 'folders', text: 'Any folder' }, { icon: 'inbox', text: 'Inbox' }],
			actions: [],
		},
		search: ['Removed', 'Active']
	},
	dialog: {
		delete: {
			text: 'Are you sure you want to permanently delete the task?',
			actionName: 'Delete'
		},
		'Clear Removed': {
			text: 'Are you sure you want to permanently clear unkept tasks?',
			actionName: 'Clear',
		},
		'deleteCategory': {
			text: 'This category contains tasks. What would you like to do?',
			actionName: 'Delete entirely',
			actionName2: 'Move & Delete',
		}
	}
}