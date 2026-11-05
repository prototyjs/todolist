export const UI_MATRIX = {
	folder: {
		INBOX:    { icon: 'inbox',   hasCount: true,  hasMenu: false },
		NEW:      { icon: 'plus',    hasCount: false, hasMenu: false },
		IDLE:     { icon: 'folder',  hasCount: true,  hasMenu: false },
		ACTIVE:   { icon: 'folder',  hasCount: true,  hasMenu: true  },
		RENAMING: { icon: 'folder',  hasCount: false, hasMenu: false },
		MOVING:   { icon: 'folder',  hasCount: true,  hasMenu: false }
	},
	category: {
		GENERAL:  { icon: 'general',  hasCount: true,  hasMenu: false, actionIcon: null },
		NEW:      { icon: 'plus',     hasCount: false, hasMenu: false, actionIcon: null },
		IDLE:     { icon: 'category', hasCount: true,  hasMenu: false, actionIcon: null },
		ACTIVE:   { icon: 'category', hasCount: true,  hasMenu: true,  actionIcon: null },
		RENAMING: { icon: 'category', hasCount: false, hasMenu: false, actionIcon: null },
		MOVING:   { icon: 'category', hasCount: true,  hasMenu: false, actionIcon: 'checked_line' },
		DELETING: { icon: 'category', hasCount: true,  hasMenu: false, actionIcon: 'checked_line' }
	}
}