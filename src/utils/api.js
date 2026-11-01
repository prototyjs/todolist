import categoryService from './categoryService.js'

export const api = {
	task: null,
	category: new categoryService()
}