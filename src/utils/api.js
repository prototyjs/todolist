import categoryService from './categoryService.js'
import taskService from './taskService.js'

export const api = {
	task: new taskService(),
	categories: new categoryService()
}