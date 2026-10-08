export default {
	defaultStatus: 'Incomplete',
	defaultFolder: 'Incomplete',
	mainFolder: 'Inbox',
	mainCategory: 'General',
	filters: {
		statuses: {
			id: 'params',
			items: [
				{ icon: 'status', text: 'Any status' },
				{ icon: 'checked', text: 'Completed' },
				{ icon: 'checked-line', text: 'Incomplete' }, // Default
				{ icon: 'spotlight', text: 'Spotlighted' }, // Only Completed
				{ icon: 'remove', text: 'Removed' }
			],
			actions: [
				{ icon: 'clear', text: 'Clear Removed', dangerous: true, for: 'Removed' },
				{ icon: 'clear', text: 'Clear Completed', dangerous: true, for: 'Completed' }
			]
		},
		folders: {
			id: 'folders',
			items: [{ icon: 'folders', text: 'Any folder' }, { icon: 'inbox', text: 'Inbox' }],
			actions: [{ icon: 'configure', text: 'Configure' }],
		},
		search: ['Removed', 'Active']
	}
}